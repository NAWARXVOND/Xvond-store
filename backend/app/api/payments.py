from decimal import Decimal
from typing import Annotated, Literal

import httpx
from fastapi import APIRouter, Depends, Header, HTTPException, Request
from pydantic import BaseModel, EmailStr
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.core.database import get_session
from app.models.commerce import Customer, Order, OrderStatus, PaymentStatus
from app.models.payment import PaymentAttempt
from app.services.email import queue_order_event
from app.services.order_lifecycle import payment_window_open
from app.services.payments.base import PaymentRequest
from app.services.payments.tap import TapPaymentProvider

router = APIRouter(prefix="/payments", tags=["payments"])
Session = Annotated[AsyncSession, Depends(get_session)]


class PaymentConfigRead(BaseModel):
    tap_enabled: bool


class TapPaymentCreate(BaseModel):
    email: EmailStr
    locale: Literal["ar", "en"] = "en"


class PaymentRedirectRead(BaseModel):
    payment_url: str
    provider_payment_id: str


def tap_provider() -> TapPaymentProvider:
    settings = get_settings()
    if not settings.tap_enabled or not settings.tap_secret_key or not settings.tap_merchant_id:
        raise HTTPException(status_code=503, detail="Tap Payments is not configured")
    return TapPaymentProvider(
        secret_key=settings.tap_secret_key,
        merchant_id=settings.tap_merchant_id,
        source_id=settings.tap_source_id,
    )


def next_payment_status(current: PaymentStatus, tap_status: str) -> PaymentStatus:
    """Map Tap updates without allowing late webhooks to regress a paid order."""
    normalized = tap_status.upper()
    if current == PaymentStatus.paid:
        return PaymentStatus.paid
    if normalized == "CAPTURED":
        return PaymentStatus.paid
    if normalized == "AUTHORIZED":
        return PaymentStatus.authorized
    if normalized in {"FAILED", "DECLINED", "CANCELLED", "ABANDONED", "VOID"}:
        return PaymentStatus.failed
    return current


@router.get("/config", response_model=PaymentConfigRead)
async def payment_config() -> PaymentConfigRead:
    return PaymentConfigRead(tap_enabled=get_settings().tap_enabled)


@router.post("/tap/orders/{order_number}", response_model=PaymentRedirectRead)
async def create_tap_payment(
    order_number: str, payload: TapPaymentCreate, session: Session
) -> PaymentRedirectRead:
    settings = get_settings()
    provider = tap_provider()

    # Serialize payment creation per order so two clicks cannot create two Tap charges.
    order = await session.scalar(
        select(Order)
        .join(Customer)
        .where(
            Order.order_number == order_number.upper(),
            Customer.email == str(payload.email).lower(),
        )
        .with_for_update()
    )
    if order is None:
        raise HTTPException(status_code=404, detail="Order not found")
    if order.payment_method != "tap":
        raise HTTPException(status_code=409, detail="Order is not configured for online payment")
    if order.payment_status == PaymentStatus.paid:
        raise HTTPException(status_code=409, detail="Order is already paid")
    if order.status != OrderStatus.pending or not payment_window_open(order):
        raise HTTPException(status_code=410, detail="Payment window has expired")

    existing = await session.scalar(
        select(PaymentAttempt)
        .where(
            PaymentAttempt.order_id == order.id,
            PaymentAttempt.provider == "tap",
            PaymentAttempt.status.in_(["INITIATED", "PENDING", "IN_PROGRESS"]),
        )
        .order_by(PaymentAttempt.created_at.desc())
    )
    if existing is not None and existing.checkout_url:
        return PaymentRedirectRead(
            payment_url=existing.checkout_url,
            provider_payment_id=existing.provider_payment_id,
        )

    customer = await session.get(Customer, order.customer_id)
    if customer is None:
        raise HTTPException(status_code=409, detail="Order customer is unavailable")
    if not settings.tap_webhook_url:
        raise HTTPException(status_code=503, detail="Tap webhook URL is not configured")

    return_url = (
        f"{settings.frontend_url.rstrip('/')}/{payload.locale}/order-confirmation"
        f"?order={order.order_number}&payment=return"
    )
    try:
        result = await provider.create_payment(
            PaymentRequest(
                order_id=order.order_number,
                amount=order.grand_total,
                currency=order.currency,
                return_url=return_url,
                webhook_url=settings.tap_webhook_url,
                customer_name=customer.full_name,
                customer_email=customer.email,
                customer_phone=customer.phone or "",
                locale=payload.locale,
            )
        )
    except (httpx.HTTPError, RuntimeError) as exc:
        await session.rollback()
        raise HTTPException(status_code=502, detail="Payment provider unavailable") from exc

    session.add(
        PaymentAttempt(
            order_id=order.id,
            provider="tap",
            provider_payment_id=result.provider_payment_id,
            status=result.status.upper(),
            amount=order.grand_total,
            currency=order.currency,
            checkout_url=result.checkout_url,
        )
    )
    await session.commit()
    return PaymentRedirectRead(
        payment_url=result.checkout_url,
        provider_payment_id=result.provider_payment_id,
    )


@router.post("/tap/webhook")
async def tap_webhook(
    request: Request,
    session: Session,
    hashstring: Annotated[str | None, Header()] = None,
) -> dict[str, bool]:
    if not hashstring:
        raise HTTPException(status_code=401, detail="Missing Tap hashstring")
    provider = tap_provider()
    payload = await request.json()
    if not await provider.verify_webhook(payload, hashstring):
        raise HTTPException(status_code=401, detail="Invalid Tap hashstring")

    charge_id = str(payload.get("id") or "")
    attempt = await session.scalar(
        select(PaymentAttempt)
        .where(PaymentAttempt.provider_payment_id == charge_id)
        .with_for_update()
    )
    if attempt is None:
        raise HTTPException(status_code=404, detail="Payment attempt not found")
    order = await session.scalar(
        select(Order).where(Order.id == attempt.order_id).with_for_update()
    )
    if order is None:
        raise HTTPException(status_code=404, detail="Order not found")

    reference_order = str((payload.get("reference") or {}).get("order") or "")
    currency = str(payload.get("currency") or "").upper()
    amount = Decimal(str(payload.get("amount") or "0"))
    if reference_order != order.order_number or currency != order.currency or amount != order.grand_total:
        raise HTTPException(status_code=409, detail="Payment does not match order")

    tap_status = str(payload.get("status") or "UNKNOWN").upper()
    was_paid = order.payment_status == PaymentStatus.paid

    # CAPTURED is terminal for the attempt too; ignore delayed lower-state events afterward.
    if attempt.status.upper() != "CAPTURED" or tap_status == "CAPTURED":
        attempt.status = tap_status

    if tap_status == "CAPTURED":
        if order.inventory_released:
            raise HTTPException(status_code=409, detail="Order inventory was already released")
        order.payment_status = PaymentStatus.paid
        if order.status == OrderStatus.pending:
            order.status = OrderStatus.confirmed
        if not was_paid:
            customer = await session.get(Customer, order.customer_id)
            if customer is not None and customer.email:
                queue_order_event(session, customer.email, order.order_number, "confirmed")
    else:
        order.payment_status = next_payment_status(order.payment_status, tap_status)

    await session.commit()
    return {"ok": True}
