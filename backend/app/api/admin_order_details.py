import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.database import get_session
from app.core.security import require_admin
from app.models.commerce import Order

router = APIRouter(prefix="/admin", tags=["admin"], dependencies=[Depends(require_admin)])
Session = Annotated[AsyncSession, Depends(get_session)]


@router.get("/orders/{order_id}/detail")
async def order_detail(order_id: uuid.UUID, session: Session) -> dict[str, object]:
    order = await session.scalar(
        select(Order).options(selectinload(Order.items)).where(Order.id == order_id)
    )
    if order is None:
        raise HTTPException(status_code=404, detail="Order not found")

    return {
        "id": str(order.id),
        "order_number": order.order_number,
        "customer_name": order.customer_name,
        "customer_email": order.customer_email,
        "customer_phone": order.customer_phone,
        "shipping_country_code": order.shipping_country_code,
        "shipping_governorate": order.shipping_governorate,
        "shipping_city": order.shipping_city,
        "shipping_address_line": order.shipping_address_line,
        "status": order.status.value,
        "payment_status": order.payment_status.value,
        "payment_method": order.payment_method,
        "currency": order.currency,
        "subtotal": str(order.subtotal),
        "discount_total": str(order.discount_total),
        "shipping_total": str(order.shipping_total),
        "tax_total": str(order.tax_total),
        "grand_total": str(order.grand_total),
        "promotion_code": order.promotion_code,
        "created_at": order.created_at,
        "items": [
            {
                "id": str(item.id),
                "product_name": item.product_name,
                "sku": item.sku,
                "unit_price": str(item.unit_price),
                "quantity": item.quantity,
                "line_total": str(item.line_total),
            }
            for item in order.items
        ],
    }
