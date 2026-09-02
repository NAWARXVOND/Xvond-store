import uuid
from decimal import Decimal

from sqlalchemy import ForeignKey, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base, TimestampMixin, UUIDMixin


class PaymentAttempt(UUIDMixin, TimestampMixin, Base):
    __tablename__ = "payment_attempts"

    order_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("orders.id", ondelete="CASCADE"), index=True)
    provider: Mapped[str] = mapped_column(String(30), index=True)
    provider_payment_id: Mapped[str] = mapped_column(String(120), unique=True, index=True)
    status: Mapped[str] = mapped_column(String(40), index=True)
    amount: Mapped[Decimal] = mapped_column(Numeric(12, 3))
    currency: Mapped[str] = mapped_column(String(3))
    checkout_url: Mapped[str | None] = mapped_column(String(1200))
