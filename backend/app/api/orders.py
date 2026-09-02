import secrets
from datetime import UTC, datetime
from decimal import Decimal
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.database import get_session
from app.models.commerce import Address, Customer, Order, OrderItem, Product
from app.schemas.orders import CheckoutCreate, OrderCreated, OrderTracking

router = APIRouter(prefix="/orders", tags=["orders"])
Session = Annotated[AsyncSession, Depends(get_session)]


def new_order_number() -> str:
    stamp = datetime.now(UTC).strftime("%y%m%d")
    return f"XV-{stamp}-{secrets.token_hex(3).upper()}"


@router.post("", response_model=OrderCreated, status_code=status.HTTP_201_CREATED)
async def create_order(payload: CheckoutCreate, session: Session) -> Order:
    slugs = {item.product_slug for item in payload.items}
    products = list(
        (
            await session.scalars(
                select(Product)
                .options(selectinload(Product.variants))
                .where(Product.slug.in_(slugs), Product.is_active.is_(True))
            )
        ).unique()
    )
    by_slug = {product.slug: product for product in products}
    if set(by_slug) != slugs:
        raise HTTPException(status_code=400, detail="One or more products are unavailable")

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
    subtotal = Decimal("0.000")
    for requested in payload.items:
        product = by_slug[requested.product_slug]
        available = [variant for variant in product.variants if variant.stock_quantity > 0]
        if not available:
            raise HTTPException(status_code=409, detail=f"{product.slug} is out of stock")
        variant = available[0]
        if variant.stock_quantity < requested.quantity:
            raise HTTPException(status_code=409, detail=f"Insufficient stock for {product.slug}")
        line_total = variant.price * requested.quantity
        subtotal += line_total
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

    order = Order(
        order_number=new_order_number(),
        customer_id=customer.id,
        subtotal=subtotal,
        grand_total=subtotal,
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
