import uuid

from sqlalchemy import ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base, TimestampMixin, UUIDMixin


class CustomerProfile(UUIDMixin, TimestampMixin, Base):
    __tablename__ = "customer_profiles"

    customer_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("customers.id", ondelete="CASCADE"), unique=True, index=True
    )
    first_name: Mapped[str | None] = mapped_column(String(90))
    last_name: Mapped[str | None] = mapped_column(String(90))
    pending_email: Mapped[str | None] = mapped_column(String(320), unique=True, index=True)
