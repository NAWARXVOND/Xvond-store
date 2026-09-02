import secrets
from datetime import UTC, datetime
from decimal import Decimal
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.database import get_session
from app.models.commerce import Address, Coupon, Customer, Discount, Order, OrderItem, Product
from app.schemas.orders import (
    CheckoutCreate,
    CheckoutItem,
    CheckoutQuote,
    OrderCreated,
    OrderTracking,
    QuoteRead,
)
from app.services.pricing import saving

router = APIRouter(prefix="/orders", tags=["orders"])
Session = Annotated[AsyncSession, Depends(get_session)]


def new_order_number() -> str:
    stamp = datetime.now(UTC).strftime("%y%m%d")
    return f"XV-{stamp}-{secrets.token_hex(3).upper()}"


async def load_products(
    items: list[CheckoutItem], session: AsyncSession, *, lock: bool = False
) -> dict[str, Product]:
    slugs = {item.product_slug for item in items}
    statement = (
        select(Product)
        .options(selectinload(Product.variants), selectinload(Product.category))
        .where(Product.slug.in_(slugs), Product.is_active.is_(True))
    )
    if lock:
        statement = statement.with_for_update()
    products = list((await session.scalars(statement)).unique())
    by_slug = {product.slug: product for product in products}
    if set(by_slug) != slugs:
        raise HTTPException(status_code=400, detail="One or more products are unavailable")
    return by_slug


def line_totals(
    items: list[CheckoutItem], products: dict[str, Product]
) -> tuple[Decimal, dict[str, Decimal]]:
    subtotal = Decimal("0.000")
    totals: dict[str, Decimal] = {}
    for requested in items:
        product = products[requested.product_slug]
        available = [variant for variant in product.variants if variant.stock_quantity > 0]
        if not available:
            raise HTTPException(status_code=409, detail=f"{product.slug} is out of stock")
        variant = available[0]
        if variant.stock_quantity < requested.quantity:
            raise HTTPException(status_code=409, detail=f"Insufficient stock for {product.slug}")
        total = variant.price * requested.quantity
        totals[product.slug] = total
        subtotal += total
    return subtotal, totals


async def best_promotion(
    subtotal: Decimal,
    totals: dict[str, Decimal],
    products: dict[str, Product],
    coupon_code: str | None,
    session: AsyncSession,
) -> tuple[Decimal, str | None, Coupon | None]:
    now = datetime.now(UTC)
    candidates: list[tuple[Decimal, str, Coupon | None]] = []
    discounts = await session.scalars(
        select(Discount).where(
            Discount.is_active.is_(True),
            or_(Discount.starts_at.is_(None), Discount.starts_at <= now),
            or_(Discount.ends_at.is_(None), Discount.ends_at >= now),
        )
    )
    for discount in discounts:
        eligible = subtotal
        if discount.scope == "product":
            eligible = totals.get(discount.scope_reference or "", Decimal("0.000"))
        elif discount.scope == "category":
            eligible = sum(
                (
                    total
                    for slug, total in totals.items()
                    if products[slug].category.slug == discount.scope_reference
                ),
                Decimal("0.000"),
            )
        amount = saving(eligible, discount.discount_type, discount.value)
        if amount > 0:
            candidates.append((amount, discount.name, None))

    coupon: Coupon | None = None
    if coupon_code:
        coupon = await session.scalar(
            select(Coupon).where(Coupon.code == coupon_code.strip().upper()).with_for_update()
        )
        valid = (
            coupon is not None
            and coupon.is_active
            and (coupon.starts_at is None or coupon.starts_at <= now)
            and (coupon.ends_at is None or coupon.ends_at >= now)
            and (coupon.minimum_order_amount is None or subtotal >= coupon.minimum_order_amount)
            and (coupon.usage_limit is None or coupon.usage_count < coupon.usage_limit)
        )
        if not valid:
            raise HTTPException(status_code=422, detail="Coupon is invalid or unavailable")
        amount = saving(subtotal, coupon.discount_type, coupon.value)
        candidates.append((amount, coupon.code, coupon))

    if not candidates:
        return Decimal("0.000"), None, None
    amount, label, applied_coupon = max(candidates, key=lambda item: item[0])
    return min(amount, subtotal), label, applied_coupon


async def calculate_quote(
    items: list[CheckoutItem],
    coupon_code: str | None,
    session: AsyncSession,
    *,
    lock: bool = False,
) -> tuple[dict[str, Product], Decimal, Decimal, str | None, Coupon | None]:
    products = await load_products(items, session, lock=lock)
    subtotal, totals = line_totals(items, products)
    discount, promotion, coupon = await best_promotion(
        subtotal, totals, products, coupon_code, session
    )
    return products, subtotal, discount, promotion, coupon


@router.post("/quote", response_model=QuoteRead)
async def quote(payload: CheckoutQuote, session: Session) -> QuoteRead:
    _, subtotal, discount, promotion, _ = await calculate_quote(
        payload.items, payload.coupon_code, session
    )
    return QuoteRead(
        subtotal=subtotal,
        discount_total=discount,
        grand_total=subtotal - discount,
        promotion_code=promotion,
    )


@router.post("", response_model=OrderCreated, status_code=status.HTTP_201_CREATED)
async def create_order(payload: CheckoutCreate, session: Session) -> Order:
    products, subtotal, discount, promotion, coupon = await calculate_quote(
        payload.items, payload.coupon_code, session, lock=True
    )
    customer = await session.scalar(
        select(Customer).where(Customer.email == payload.customer.email)
    )
    if customer is None:
        customer = Customer(
            email=payload.customer.email,
            phone=payload.customer.phone,
            full_name=payload.customer.fullName,
        )
        session.add(customer)
        await session.flush()

    session.add(
        Address(
            customer_id=customer.id,
            governorate=payload.customer.governorate,
            city=payload.customer.city,
            address_line=payload.customer.addressLine,
        )
    )
    lines: list[OrderItem] = []
    for requested in payload.items:
        product = products[requested.product_slug]
        variant = next(item for item in product.variants if item.stock_quantity > 0)
        variant.stock_quantity -= requested.quantity
        line_total = variant.price * requested.quantity
        lines.append(
            OrderItem(
                product_id=product.id,
                variant_id=variant.id,
                product_name=product.name_en,
                sku=variant.sku,
                unit_price=variant.price,
                quantity=requested.quantity,
                line_total=line_total,
            )
        )
    if coupon is not None and promotion == coupon.code:
        coupon.usage_count += 1
    order = Order(
        order_number=new_order_number(),
        customer_id=customer.id,
        subtotal=subtotal,
        discount_total=discount,
        grand_total=subtotal - discount,
        promotion_code=promotion,
        items=lines,
    )
    session.add(order)
    await session.commit()
    await session.refresh(order)
    return order


@router.get("/{order_number}/track", response_model=OrderTracking)
async def track_order(
    order_number: str,
    session: Session,
    email: Annotated[str, Query(min_length=5, max_length=320)],
) -> Order:
    order = await session.scalar(
        select(Order)
        .join(Customer)
        .where(Order.order_number == order_number.upper(), Customer.email == email)
    )
    if order is None:
        raise HTTPException(status_code=404, detail="Order not found")
    return order
