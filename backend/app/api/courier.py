import secrets
import uuid
from datetime import datetime
from typing import Annotated, Literal

from fastapi import APIRouter, Depends, Header, HTTPException, Query, status
from pydantic import BaseModel, Field, HttpUrl
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.config import get_settings
from app.core.database import get_session
from app.core.security import require_admin
from app.models.commerce import Order, OrderStatus, PaymentStatus
from app.models.integrations import Shipment, ShipmentEvent

router = APIRouter(tags=["courier"])
Session = Annotated[AsyncSession, Depends(get_session)]


class ShipmentWrite(BaseModel):
    provider: str = Field(min_length=2, max_length=60)
    external_id: str | None = Field(default=None, max_length=160)
    tracking_number: str | None = Field(default=None, max_length=160)
    tracking_url: HttpUrl | None = None
    status: str = Field(default="created", min_length=2, max_length=40)
    cod_status: str | None = Field(default=None, max_length=40)


class ShipmentEventWrite(BaseModel):
    event_code: str = Field(min_length=2, max_length=60)
    label_ar: str = Field(min_length=2, max_length=200)
    label_en: str = Field(min_length=2, max_length=200)
    location: str | None = Field(default=None, max_length=200)
    occurred_at: datetime
    raw_reference: str | None = Field(default=None, max_length=2000)
    shipment_status: str | None = Field(default=None, max_length=40)
    cod_status: Literal["pending", "collected", "settled", "failed"] | None = None


class NormalizedCourierWebhook(BaseModel):
    provider: str = Field(min_length=2, max_length=60)
    tracking_number: str = Field(min_length=2, max_length=160)
    event: ShipmentEventWrite


def shipment_payload(shipment: Shipment) -> dict[str, object]:
    return {
        "id": str(shipment.id),
        "provider": shipment.provider,
        "external_id": shipment.external_id,
        "tracking_number": shipment.tracking_number,
        "tracking_url": shipment.tracking_url,
        "status": shipment.status,
        "cod_status": shipment.cod_status,
        "last_event_at": shipment.last_event_at,
        "events": [
            {
                "event_code": event.event_code,
                "label_ar": event.label_ar,
                "label_en": event.label_en,
                "location": event.location,
                "occurred_at": event.occurred_at,
            }
            for event in sorted(shipment.events, key=lambda item: item.occurred_at)
        ],
    }


def is_duplicate_event(shipment: Shipment, payload: ShipmentEventWrite) -> bool:
    return any(
        event.event_code == payload.event_code
        and event.occurred_at == payload.occurred_at
        and event.raw_reference == payload.raw_reference
        for event in shipment.events
    )


async def apply_event(
    session: AsyncSession,
    shipment: Shipment,
    payload: ShipmentEventWrite,
) -> None:
    if is_duplicate_event(shipment, payload):
        return

    order = await session.get(Order, shipment.order_id)
    if order is None:
        raise HTTPException(status_code=404, detail="Order not found")

    session.add(
        ShipmentEvent(
            shipment_id=shipment.id,
            event_code=payload.event_code,
            label_ar=payload.label_ar,
            label_en=payload.label_en,
            location=payload.location,
            occurred_at=payload.occurred_at,
            raw_reference=payload.raw_reference,
        )
    )

    # Store the complete event history, but only let the newest event advance the
    # current shipment/order state. Courier webhooks can arrive out of order.
    if shipment.last_event_at is not None and payload.occurred_at < shipment.last_event_at:
        return

    if payload.shipment_status:
        shipment.status = payload.shipment_status
    if payload.cod_status:
        shipment.cod_status = payload.cod_status
    shipment.last_event_at = payload.occurred_at

    normalized = (payload.shipment_status or payload.event_code).lower()
    if (
        normalized in {"picked_up", "in_transit", "out_for_delivery", "shipped"}
        and order.status in {OrderStatus.pending, OrderStatus.confirmed, OrderStatus.processing}
    ):
        order.status = OrderStatus.shipped
    if normalized == "delivered":
        order.status = OrderStatus.delivered
    if order.payment_method == "cash_on_delivery" and payload.cod_status in {"collected", "settled"}:
        order.payment_status = PaymentStatus.paid


@router.put(
    "/admin/orders/{order_id}/shipment",
    dependencies=[Depends(require_admin)],
)
async def upsert_shipment(
    order_id: uuid.UUID,
    payload: ShipmentWrite,
    session: Session,
) -> dict[str, object]:
    order = await session.get(Order, order_id)
    if order is None:
        raise HTTPException(status_code=404, detail="Order not found")
    shipment = await session.scalar(
        select(Shipment).options(selectinload(Shipment.events)).where(Shipment.order_id == order_id)
    )
    values = payload.model_dump()
    if values.get("tracking_url") is not None:
        values["tracking_url"] = str(values["tracking_url"])
    if shipment is None:
        shipment = Shipment(order_id=order_id, **values)
        session.add(shipment)
        await session.flush()
        shipment.events = []
    else:
        for key, value in values.items():
            setattr(shipment, key, value)
    await session.commit()
    await session.refresh(shipment, attribute_names=["events"])
    return shipment_payload(shipment)


@router.post(
    "/admin/shipments/{shipment_id}/events",
    dependencies=[Depends(require_admin)],
    status_code=status.HTTP_201_CREATED,
)
async def add_shipment_event(
    shipment_id: uuid.UUID,
    payload: ShipmentEventWrite,
    session: Session,
) -> dict[str, object]:
    shipment = await session.scalar(
        select(Shipment)
        .options(selectinload(Shipment.events))
        .where(Shipment.id == shipment_id)
        .with_for_update()
    )
    if shipment is None:
        raise HTTPException(status_code=404, detail="Shipment not found")
    await apply_event(session, shipment, payload)
    await session.commit()
    await session.refresh(shipment, attribute_names=["events"])
    return shipment_payload(shipment)


@router.post("/courier/webhook", status_code=status.HTTP_202_ACCEPTED)
async def courier_webhook(
    payload: NormalizedCourierWebhook,
    session: Session,
    webhook_secret: Annotated[str | None, Header(alias="X-Xvond-Courier-Secret")] = None,
) -> dict[str, str]:
    settings = get_settings()
    if not settings.courier_webhook_secret:
        raise HTTPException(status_code=503, detail="Courier webhook is not configured")
    if not webhook_secret or not secrets.compare_digest(webhook_secret, settings.courier_webhook_secret):
        raise HTTPException(status_code=401, detail="Invalid courier webhook signature")
    shipment = await session.scalar(
        select(Shipment)
        .options(selectinload(Shipment.events))
        .where(
            Shipment.provider == payload.provider,
            Shipment.tracking_number == payload.tracking_number,
        )
        .with_for_update()
    )
    if shipment is None:
        raise HTTPException(status_code=404, detail="Shipment not found")
    await apply_event(session, shipment, payload.event)
    await session.commit()
    return {"status": "accepted"}


@router.get("/orders/{order_number}/shipment")
async def public_shipment_tracking(
    order_number: str,
    session: Session,
    email: Annotated[str, Query(min_length=5, max_length=320)],
) -> dict[str, object]:
    order = await session.scalar(
        select(Order).where(
            Order.order_number == order_number.upper(),
            Order.customer_email == email.lower(),
        )
    )
    if order is None:
        raise HTTPException(status_code=404, detail="Order not found")
    shipment = await session.scalar(
        select(Shipment).options(selectinload(Shipment.events)).where(Shipment.order_id == order.id)
    )
    if shipment is None:
        return {
            "order_number": order.order_number,
            "order_status": order.status,
            "shipment": None,
        }
    return {
        "order_number": order.order_number,
        "order_status": order.status,
        "shipment": shipment_payload(shipment),
    }
