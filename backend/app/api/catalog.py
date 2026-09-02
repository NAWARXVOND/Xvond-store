from decimal import Decimal
from typing import Annotated, Literal

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.database import get_session
from app.models.commerce import Category, Product, ProductVariant
from app.schemas.catalog import CategoryRead, ProductRead

router = APIRouter(prefix="/catalog", tags=["catalog"])
Session = Annotated[AsyncSession, Depends(get_session)]


@router.get("/categories", response_model=list[CategoryRead])
async def list_categories(session: Session) -> list[Category]:
    result = await session.scalars(
        select(Category).where(Category.is_active.is_(True)).order_by(Category.name_en)
    )
    return list(result)


@router.get("/products", response_model=list[ProductRead])
async def list_products(
    session: Session,
    category: str | None = None,
    query: Annotated[str | None, Query(max_length=120)] = None,
    min_price: Annotated[Decimal | None, Query(ge=0)] = None,
    max_price: Annotated[Decimal | None, Query(ge=0)] = None,
    in_stock: bool | None = None,
    sort: Literal["newest", "price-asc", "price-desc"] = "newest",
    limit: Annotated[int, Query(ge=1, le=100)] = 24,
    offset: Annotated[int, Query(ge=0)] = 0,
) -> list[Product]:
    statement = (
        select(Product)
        .options(selectinload(Product.variants), selectinload(Product.category))
        .where(Product.is_active.is_(True))
    )
    if category:
        statement = statement.join(Category).where(Category.slug == category)
    if query:
        term = f"%{query.strip()}%"
        statement = statement.where(
            or_(Product.name_ar.ilike(term), Product.name_en.ilike(term), Product.sku.ilike(term))
        )
    price = (
        select(func.min(ProductVariant.price))
        .where(ProductVariant.product_id == Product.id)
        .correlate(Product)
        .scalar_subquery()
    )
    stock = (
        select(func.coalesce(func.sum(ProductVariant.stock_quantity), 0))
        .where(ProductVariant.product_id == Product.id)
        .correlate(Product)
        .scalar_subquery()
    )
    if min_price is not None:
        statement = statement.where(price >= min_price)
    if max_price is not None:
        statement = statement.where(price <= max_price)
    if in_stock:
        statement = statement.where(stock > 0)
    ordering = {
        "newest": Product.created_at.desc(),
        "price-asc": price.asc(),
        "price-desc": price.desc(),
    }[sort]
    result = await session.scalars(statement.order_by(ordering).limit(limit).offset(offset))
    return list(result.unique())


@router.get("/products/{slug}", response_model=ProductRead)
async def get_product(slug: str, session: Session) -> Product:
    product = await session.scalar(
        select(Product)
        .options(selectinload(Product.variants), selectinload(Product.category))
        .where(Product.slug == slug, Product.is_active.is_(True))
    )
    if product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


@router.get("/search/suggestions", response_model=list[str])
async def search_suggestions(
    session: Session, q: Annotated[str, Query(min_length=2, max_length=80)]
) -> list[str]:
    term = f"%{q.strip()}%"
    result = await session.scalars(
        select(func.coalesce(Product.name_ar, Product.name_en))
        .where(
            Product.is_active.is_(True),
            or_(Product.name_ar.ilike(term), Product.name_en.ilike(term)),
        )
        .limit(8)
    )
    return list(result)
