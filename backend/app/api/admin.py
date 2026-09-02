from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.database import get_session
from app.core.security import require_admin
from app.models.commerce import Category, Product, ProductVariant
from app.schemas.catalog import CategoryRead, ProductCreate, ProductRead

router = APIRouter(prefix="/admin", tags=["admin"], dependencies=[Depends(require_admin)])
Session = Annotated[AsyncSession, Depends(get_session)]


@router.post("/products", response_model=ProductRead, status_code=status.HTTP_201_CREATED)
async def create_product(payload: ProductCreate, session: Session) -> Product:
    product = Product(**payload.model_dump())
    session.add(product)
    await session.commit()
    await session.refresh(product, attribute_names=["variants"])
    return product


@router.get("/overview")
async def overview() -> dict[str, str]:
    return {"status": "ready", "scope": "commerce-admin-foundation"}


@router.get("/products", response_model=list[ProductRead])
async def admin_products(session: Session) -> list[Product]:
    result = await session.scalars(
        select(Product).options(selectinload(Product.variants)).order_by(Product.created_at.desc())
    )
    return list(result.unique())


@router.get("/categories", response_model=list[CategoryRead])
async def admin_categories(session: Session) -> list[Category]:
    return list(await session.scalars(select(Category).order_by(Category.name_en)))


@router.patch("/inventory/{sku}")
async def update_inventory(sku: str, quantity: int, session: Session) -> dict[str, int | str]:
    variant = await session.scalar(select(ProductVariant).where(ProductVariant.sku == sku))
    if variant is None:
        raise HTTPException(status_code=404, detail="Variant not found")
    if quantity < 0:
        raise HTTPException(status_code=422, detail="Quantity cannot be negative")
    variant.stock_quantity = quantity
    await session.commit()
    return {"sku": sku, "stock_quantity": quantity}
