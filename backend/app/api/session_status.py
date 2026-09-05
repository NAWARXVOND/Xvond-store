import uuid
from typing import Annotated

from fastapi import APIRouter, Cookie, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.accounts import profile
from app.core.database import get_session
from app.core.security import SESSION_COOKIE, decode_session
from app.models.commerce import Customer

router = APIRouter(tags=["authentication"])
Session = Annotated[AsyncSession, Depends(get_session)]


@router.get("/auth/session")
async def session_status(
    session: Session,
    session_cookie: Annotated[str | None, Cookie(alias=SESSION_COOKIE)] = None,
) -> dict[str, object]:
    """Return a guest-safe session snapshot without using 401 for normal signed-out traffic."""
    payload = decode_session(session_cookie)
    if payload.get("role") != "customer":
        return {"authenticated": False, "profile": None}
    try:
        customer_id = uuid.UUID(str(payload["sub"]))
    except (ValueError, KeyError):
        return {"authenticated": False, "profile": None}
    customer = await session.get(Customer, customer_id)
    if customer is None or not customer.is_active:
        return {"authenticated": False, "profile": None}
    return {"authenticated": True, "profile": profile(customer).model_dump(mode="json")}
