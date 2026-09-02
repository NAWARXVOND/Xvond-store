from typing import Annotated

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_session
from app.core.security import require_admin
from app.models.commerce import Product
from app.schemas.catalog import ProductCreate, ProductRead

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
