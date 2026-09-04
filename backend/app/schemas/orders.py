from datetime import datetime
from decimal import Decimal
from typing import Literal

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator

from app.models.commerce import OrderStatus, PaymentStatus
from app.services.shipping.local import OMAN_GOVERNORATE_KEYS, normalize_governorate


class CheckoutCustomer(BaseModel):
    fullName: str = Field(min_length=2, max_length=180)
    email: EmailStr
    phone: str = Field(min_length=8, max_length=20)
    countryCode: Literal["OM"] = "OM"
    governorate: str = Field(min_length=2, max_length=120)
    city: str = Field(min_length=2, max_length=120)
    addressLine: str = Field(min_length=5, max_length=300)

    @field_validator("governorate")
    @classmethod
    def validate_oman_governorate(cls, value: str) -> str:
        normalized = normalize_governorate(value)
        if normalized not in OMAN_GOVERNORATE_KEYS:
            raise ValueError("Governorate must be one of the supported Oman governorates")
        return normalized


class CheckoutItem(BaseModel):
    product_slug: str = Field(pattern=r"^[a-z0-9]+(?:-[a-z0-9]+)*$", max_length=180)
    quantity: int = Field(ge=1, le=99)


class CheckoutCreate(BaseModel):
    customer: CheckoutCustomer
    items: list[CheckoutItem] = Field(min_length=1, max_length=100)
    coupon_code: str | None = Field(default=None, min_length=2, max_length=60)
    payment_method: Literal["tap", "cash_on_delivery"] = "tap"


class CheckoutQuote(BaseModel):
    items: list[CheckoutItem] = Field(min_length=1, max_length=100)
    coupon_code: str | None = Field(default=None, min_length=2, max_length=60)
    governorate: str | None = Field(default=None, min_length=2, max_length=120)

    @field_validator("governorate")
    @classmethod
    def validate_oman_governorate(cls, value: str | None) -> str | None:
        if value is None:
            return None
        normalized = normalize_governorate(value)
        if normalized not in OMAN_GOVERNORATE_KEYS:
            raise ValueError("Governorate must be one of the supported Oman governorates")
        return normalized


class QuoteRead(BaseModel):
    currency: str = "OMR"
    subtotal: Decimal
    discount_total: Decimal
    shipping_total: Decimal
    tax_total: Decimal
    grand_total: Decimal
    prices_include_vat: bool = False
    vat_rate_percent: Decimal = Decimal("0.000")
    promotion_code: str | None = None
    shipping_available: bool = False
    estimated_days_min: int | None = None
    estimated_days_max: int | None = None


class OrderCreated(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    order_number: str
    status: OrderStatus
    payment_status: PaymentStatus
    payment_method: str
    currency: str
    subtotal: Decimal
    discount_total: Decimal
    shipping_total: Decimal
    tax_total: Decimal
    grand_total: Decimal
    prices_include_vat: bool = False
    vat_rate_percent: Decimal = Decimal("0.000")
    promotion_code: str | None
    payment_expires_at: datetime | None


class OrderTracking(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    order_number: str
    status: OrderStatus
    payment_status: PaymentStatus
    payment_method: str
    payment_expires_at: datetime | None
