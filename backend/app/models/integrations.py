import uuid
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin, UUIDMixin


class AuthIdentity(UUIDMixin, TimestampMixin, Base):
    __tablename__ = "auth_identities"
    __table_args__ = (UniqueConstraint("provider", "subject"),)

    customer_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("customers.id", ondelete="CASCADE"), index=True
    )
    provider: Mapped[str] = mapped_column(String(30), index=True)
    subject: Mapped[str] = mapped_column(String(320), index=True)
    email: Mapped[str | None] = mapped_column(String(320))
    phone: Mapped[str | None] = mapped_column(String(32))


class Shipment(UUIDMixin, TimestampMixin, Base):
    __tablename__ = "shipments"

    order_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("orders.id", ondelete="CASCADE"), unique=True, index=True
    )
    provider: Mapped[str] = mapped_column(String(60), index=True)
    external_id: Mapped[str | None] = mapped_column(String(160), index=True)
    tracking_number: Mapped[str | None] = mapped_column(String(160), index=True)
    tracking_url: Mapped[str | None] = mapped_column(String(1000))
    status: Mapped[str] = mapped_column(String(40), default="created", index=True)
    cod_status: Mapped[str | None] = mapped_column(String(40), index=True)
    last_event_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    events: Mapped[list["ShipmentEvent"]] = relationship(
        back_populates="shipment", cascade="all, delete-orphan"
    )


class ShipmentEvent(UUIDMixin, TimestampMixin, Base):
    __tablename__ = "shipment_events"

    shipment_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("shipments.id", ondelete="CASCADE"), index=True
    )
    event_code: Mapped[str] = mapped_column(String(60), index=True)
    label_ar: Mapped[str] = mapped_column(String(200))
    label_en: Mapped[str] = mapped_column(String(200))
    location: Mapped[str | None] = mapped_column(String(200))
    occurred_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), index=True)
    raw_reference: Mapped[str | None] = mapped_column(Text)
    shipment: Mapped[Shipment] = relationship(back_populates="events")
