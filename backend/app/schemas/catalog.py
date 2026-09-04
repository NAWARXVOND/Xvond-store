import uuid
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field


class CategoryRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    slug: str
    name_ar: str
    name_en: str
    description_ar: str | None
    description_en: str | None


class VariantRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    sku: str
    title_ar: str
    title_en: str
    price: Decimal = Field(ge=0, decimal_places=3)
    compare_at_price: Decimal | None = None
    stock_quantity: int = Field(ge=0)


class ProductRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    slug: str
    sku: str
    name_ar: str
    name_en: str
    description_ar: str | None
    description_en: str | None
    primary_image_url: str | None
    category_id: uuid.UUID
    category: CategoryRead
    variants: list[VariantRead]
    is_active: bool


class ProductCreate(BaseModel):
    slug: str = Field(pattern=r"^[a-z0-9]+(?:-[a-z0-9]+)*$", max_length=180)
    sku: str = Field(min_length=2, max_length=80)
    name_ar: str = Field(min_length=2, max_length=250)
    name_en: str = Field(min_length=2, max_length=250)
    description_ar: str | None = Field(default=None, max_length=10000)
    description_en: str | None = Field(default=None, max_length=10000)
    category_id: uuid.UUID
