from datetime import UTC, datetime

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.commerce import Coupon, Order, OrderStatus, PaymentStatus, ProductVariant
from app.models.payment import PaymentAttempt

ACTIVE_PAYMENT_ATTEMPT_STATUSES = {"INITIATED", "PENDING", "IN_PROGRESS"}


def payment_window_open(order: Order, now: datetime | None = None) -> bool:
    current = now or datetime.now(UTC)
    return order.payment_expires_at is None or order.payment_expires_at > current


async def has_active_payment_attempt(session: AsyncSession, order_id: object) -> bool:
    attempt = await session.scalar(
        select(PaymentAttempt.id).where(
            PaymentAttempt.order_id == order_id,
            PaymentAttempt.status.in_(ACTIVE_PAYMENT_ATTEMPT_STATUSES),
        )
    )
    return attempt is not None


async def release_order_inventory(session: AsyncSession, order: Order) -> bool:
    if order.inventory_released:
        return False
    for item in order.items:
        if item.variant_id is None:
            continue
        variant = await session.scalar(
            select(ProductVariant).where(ProductVariant.id == item.variant_id).with_for_update()
        )
        if variant is not None:
            variant.stock_quantity += item.quantity
    if order.promotion_code:
        coupon = await session.scalar(
            select(Coupon).where(Coupon.code == order.promotion_code).with_for_update()
        )
        if coupon is not None and coupon.usage_count > 0:
            coupon.usage_count -= 1
    order.inventory_released = True
    return True


async def expire_order(session: AsyncSession, order: Order) -> bool:
    if order.status != OrderStatus.pending or order.payment_status == PaymentStatus.paid:
        return False
    if payment_window_open(order):
        return False
    if await has_active_payment_attempt(session, order.id):
        return False
    await release_order_inventory(session, order)
    order.status = OrderStatus.cancelled
    if order.payment_status == PaymentStatus.pending:
        order.payment_status = PaymentStatus.failed
    return True


async def expire_due_orders(session: AsyncSession, *, limit: int = 100) -> int:
    now = datetime.now(UTC)
    orders = list(
        await session.scalars(
            select(Order)
            .options(selectinload(Order.items))
            .where(
                Order.status == OrderStatus.pending,
                Order.payment_status.in_([PaymentStatus.pending, PaymentStatus.failed]),
                Order.payment_expires_at.is_not(None),
                Order.payment_expires_at <= now,
                Order.inventory_released.is_(False),
            )
            .order_by(Order.payment_expires_at)
            .limit(limit)
            .with_for_update(skip_locked=True)
        )
    )
    expired = 0
    for order in orders:
        if await expire_order(session, order):
            expired += 1
    if expired:
        await session.commit()
    else:
        await session.rollback()
    return expired
