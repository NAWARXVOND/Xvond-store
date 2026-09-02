from decimal import Decimal

from sqlalchemy import Boolean, Integer, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base, TimestampMixin, UUIDMixin


class ShippingRate(UUIDMixin, TimestampMixin, Base):
    __tablename__ = "shipping_rates"

    governorate_key: Mapped[str] = mapped_column(String(120), unique=True, index=True)
    name_ar: Mapped[str] = mapped_column(String(160))
    name_en: Mapped[str] = mapped_column(String(160))
    amount: Mapped[Decimal] = mapped_column(Numeric(12, 3))
    free_over: Mapped[Decimal | None] = mapped_column(Numeric(12, 3))
    estimated_days_min: Mapped[int] = mapped_column(Integer, default=1)
    estimated_days_max: Mapped[int] = mapped_column(Integer, default=3)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, index=True)
