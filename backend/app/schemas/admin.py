import uuid
from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field, HttpUrl

from app.models.commerce import OrderStatus, PaymentStatus


class CategoryCreate(BaseModel):
    slug: str = Field(pattern=r"^[a-z0-9]+(?:-[a-z0-9]+)*$", max_length=140)
    name_ar: str = Field(min_length=2, max_length=200)
    name_en: str = Field(min_length=2, max_length=200)
    description_ar: str | None = Field(default=None, max_length=5000)
    description_en: str | None = Field(default=None, max_length=5000)


class VariantCreate(BaseModel):
    sku: str = Field(min_length=2, max_length=80)
    title_ar: str = Field(min_length=1, max_length=180)
    title_en: str = Field(min_length=1, max_length=180)
    price: Decimal = Field(gt=0, decimal_places=3)
    compare_at_price: Decimal | None = Field(default=None, gt=0, decimal_places=3)
    stock_quantity: int = Field(ge=0, le=1_000_000)


class AdminProductCreate(BaseModel):
    slug: str = Field(pattern=r"^[a-z0-9]+(?:-[a-z0-9]+)*$", max_length=180)
    sku: str = Field(min_length=2, max_length=80)
    name_ar: str = Field(min_length=2, max_length=250)
    name_en: str = Field(min_length=2, max_length=250)
    description_ar: str | None = Field(default=None, max_length=10000)
    description_en: str | None = Field(default=None, max_length=10000)
    primary_image_url: HttpUrl | None = None
    category_id: uuid.UUID
    variant: VariantCreate


class ProductUpdate(BaseModel):
    name_ar: str | None = Field(default=None, min_length=2, max_length=250)
    name_en: str | None = Field(default=None, min_length=2, max_length=250)
    description_ar: str | None = Field(default=None, max_length=10000)
    description_en: str | None = Field(default=None, max_length=10000)
    primary_image_url: HttpUrl | None = None
    category_id: uuid.UUID | None = None
    is_active: bool | None = None


class CouponWrite(BaseModel):
    code: str = Field(pattern=r"^[A-Za-z0-9_-]+$", min_length=2, max_length=60)
    discount_type: str = Field(pattern=r"^(percentage|fixed)$")
    value: Decimal = Field(gt=0)
    minimum_order_amount: Decimal | None = Field(default=None, ge=0)
    usage_limit: int | None = Field(default=None, ge=1)
    starts_at: datetime | None = None
    ends_at: datetime | None = None
    is_active: bool = True


class DiscountWrite(BaseModel):
    name: str = Field(min_length=2, max_length=160)
    discount_type: str = Field(pattern=r"^(percentage|fixed)$")
    value: Decimal = Field(gt=0)
    scope: str = Field(pattern=r"^(store|category|product)$")
    scope_reference: str | None = Field(default=None, max_length=180)
    starts_at: datetime | None = None
    ends_at: datetime | None = None
    is_active: bool = True


class OrderAdminRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    order_number: str
    status: OrderStatus
    payment_status: PaymentStatus
    currency: str
    subtotal: Decimal
    discount_total: Decimal
    grand_total: Decimal
    promotion_code: str | None
    created_at: datetime


class OrderStatusUpdate(BaseModel):
    status: OrderStatus | None = None
    payment_status: PaymentStatus | None = None


class ReturnStatusUpdate(BaseModel):
    status: str = Field(pattern=r"^(requested|reviewing|approved|rejected|received|refunded)$")


class StoreSettingWrite(BaseModel):
    key: str = Field(pattern=r"^[a-z][a-z0-9_]*$", max_length=100)
    value: str = Field(max_length=5000)
