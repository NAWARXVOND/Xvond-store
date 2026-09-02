import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_session
from app.core.security import require_admin
from app.models.shipping import ShippingRate
from app.schemas.admin import ShippingRateWrite
from app.services.shipping.local import normalize_governorate

router = APIRouter(
    prefix="/admin/shipping-rates",
    tags=["admin-shipping"],
    dependencies=[Depends(require_admin)],
)
Session = Annotated[AsyncSession, Depends(get_session)]


def serialize(rate: ShippingRate) -> dict[str, object]:
    return {
        "id": str(rate.id),
        "governorate": rate.governorate_key,
        "name_ar": rate.name_ar,
        "name_en": rate.name_en,
        "amount": str(rate.amount),
        "free_over": str(rate.free_over) if rate.free_over is not None else None,
        "estimated_days_min": rate.estimated_days_min,
        "estimated_days_max": rate.estimated_days_max,
        "is_active": rate.is_active,
    }


@router.get("")
async def list_shipping_rates(session: Session) -> list[dict[str, object]]:
    rates = await session.scalars(select(ShippingRate).order_by(ShippingRate.name_en))
    return [serialize(rate) for rate in rates]


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_shipping_rate(payload: ShippingRateWrite, session: Session) -> dict[str, object]:
    key = normalize_governorate(payload.governorate)
    existing = await session.scalar(
        select(ShippingRate).where(ShippingRate.governorate_key == key)
    )
    if existing is not None:
        raise HTTPException(status_code=409, detail="Shipping rate already exists")
    values = payload.model_dump(exclude={"governorate"})
    rate = ShippingRate(governorate_key=key, **values)
    session.add(rate)
    await session.commit()
    await session.refresh(rate)
    return serialize(rate)


@router.put("/{rate_id}")
async def update_shipping_rate(
    rate_id: uuid.UUID, payload: ShippingRateWrite, session: Session
) -> dict[str, object]:
    rate = await session.get(ShippingRate, rate_id)
    if rate is None:
        raise HTTPException(status_code=404, detail="Shipping rate not found")
    rate.governorate_key = normalize_governorate(payload.governorate)
    for key, value in payload.model_dump(exclude={"governorate"}).items():
        setattr(rate, key, value)
    await session.commit()
    await session.refresh(rate)
    return serialize(rate)


@router.delete("/{rate_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_shipping_rate(rate_id: uuid.UUID, session: Session) -> None:
    rate = await session.get(ShippingRate, rate_id)
    if rate is None:
        raise HTTPException(status_code=404, detail="Shipping rate not found")
    await session.delete(rate)
    await session.commit()
