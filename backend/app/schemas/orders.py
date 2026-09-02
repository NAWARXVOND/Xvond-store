from decimal import Decimal

from pydantic import BaseModel, ConfigDict, EmailStr, Field

from app.models.commerce import OrderStatus, PaymentStatus


class CheckoutCustomer(BaseModel):
    fullName: str = Field(min_length=2, max_length=180)
    email: EmailStr
    phone: str = Field(min_length=8, max_length=20)
    governorate: str = Field(min_length=2, max_length=120)
    city: str = Field(min_length=2, max_length=120)
    addressLine: str = Field(min_length=5, max_length=300)


class CheckoutItem(BaseModel):
    product_slug: str = Field(pattern=r"^[a-z0-9]+(?:-[a-z0-9]+)*$", max_length=180)
    quantity: int = Field(ge=1, le=99)


class CheckoutCreate(BaseModel):
    customer: CheckoutCustomer
    items: list[CheckoutItem] = Field(min_length=1, max_length=100)


class OrderCreated(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    order_number: str
    status: OrderStatus
    payment_status: PaymentStatus
    currency: str
    subtotal: Decimal
    grand_total: Decimal


class OrderTracking(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    order_number: str
    status: OrderStatus
    payment_status: PaymentStatus
