from typing import Annotated

import httpx
from fastapi import APIRouter, Depends, HTTPException, Response
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.accounts import set_session_cookie
from app.api.external_auth import normalize_oman_phone
from app.core.config import get_settings
from app.core.database import get_session
from app.core.security import create_session
from app.models.commerce import Customer
from app.models.integrations import AuthIdentity

router = APIRouter(prefix="/auth", tags=["authentication"])
Session = Annotated[AsyncSession, Depends(get_session)]


class PhoneConfirmRequest(BaseModel):
    phone: str = Field(min_length=8, max_length=20)
    code: str = Field(min_length=4, max_length=10)


@router.post("/phone/confirm")
async def phone_confirm(
    payload: PhoneConfirmRequest,
    response: Response,
    session: Session,
) -> dict[str, str | None]:
    settings = get_settings()
    if not settings.phone_auth_enabled:
        raise HTTPException(status_code=503, detail="Phone sign-in is not configured")

    phone = normalize_oman_phone(payload.phone)
    url = (
        f"https://verify.twilio.com/v2/Services/{settings.twilio_verify_service_sid}"
        "/VerificationCheck"
    )
    async with httpx.AsyncClient(timeout=15) as client:
        verify_response = await client.post(
            url,
            auth=(settings.twilio_account_sid or "", settings.twilio_auth_token or ""),
            data={"To": phone, "Code": payload.code},
        )
    if not verify_response.is_success or verify_response.json().get("status") != "approved":
        raise HTTPException(status_code=401, detail="Verification code is invalid or expired")

    identity = await session.scalar(
        select(AuthIdentity).where(
            AuthIdentity.provider == "phone",
            AuthIdentity.subject == phone,
        )
    )
    customer = await session.get(Customer, identity.customer_id) if identity else None
    if customer is None:
        customer = await session.scalar(select(Customer).where(Customer.phone == phone))
    if customer is None:
        customer = Customer(
            email=None,
            phone=phone,
            full_name="Xvond Member",
        )
        session.add(customer)
        await session.flush()
    if not customer.is_active:
        raise HTTPException(status_code=401, detail="Account is unavailable")
    if customer.phone is None:
        customer.phone = phone

    if identity is None:
        session.add(
            AuthIdentity(
                customer_id=customer.id,
                provider="phone",
                subject=phone,
                phone=phone,
            )
        )

    await session.commit()
    await session.refresh(customer)
    set_session_cookie(response, create_session(str(customer.id), "customer"))
    return {"id": str(customer.id), "email": customer.email, "phone": customer.phone}
