import hashlib
import secrets
from datetime import UTC, datetime, timedelta
from typing import Annotated

import httpx
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.accounts import CurrentCustomer
from app.api.external_auth import normalize_oman_phone
from app.core.config import get_settings
from app.core.database import get_session
from app.models.commerce import AccountToken, Customer, EmailOutbox
from app.models.integrations import AuthIdentity
from app.models.profile import CustomerProfile
from app.schemas.auth import TokenRequest
from app.schemas.profile import (
    ProfileDetailsRead,
    ProfileDetailsUpdate,
    ProfileEmailStart,
    ProfilePhoneConfirm,
    ProfilePhoneStart,
)

router = APIRouter(prefix="/account", tags=["account-profile"])
Session = Annotated[AsyncSession, Depends(get_session)]


async def get_or_create_profile(customer: Customer, session: AsyncSession) -> CustomerProfile:
    profile = await session.scalar(
        select(CustomerProfile).where(CustomerProfile.customer_id == customer.id)
    )
    if profile is None:
        profile = CustomerProfile(customer_id=customer.id)
        session.add(profile)
        await session.flush()
    return profile


async def phone_is_verified(customer: Customer, session: AsyncSession) -> bool:
    if not customer.phone:
        return False
    identity = await session.scalar(
        select(AuthIdentity.id).where(
            AuthIdentity.customer_id == customer.id,
            AuthIdentity.provider == "phone",
            AuthIdentity.subject == customer.phone,
        )
    )
    return identity is not None


async def serialize_profile(customer: Customer, session: AsyncSession) -> ProfileDetailsRead:
    details = await get_or_create_profile(customer, session)
    return ProfileDetailsRead(
        first_name=details.first_name,
        last_name=details.last_name,
        full_name=customer.full_name,
        email=customer.email,
        phone=customer.phone,
        email_verified=customer.email_verified,
        phone_verified=await phone_is_verified(customer, session),
        pending_email=details.pending_email,
    )


@router.get("/profile", response_model=ProfileDetailsRead)
async def read_profile(customer: CurrentCustomer, session: Session) -> ProfileDetailsRead:
    result = await serialize_profile(customer, session)
    await session.commit()
    return result


@router.patch("/profile", response_model=ProfileDetailsRead)
async def update_profile(
    payload: ProfileDetailsUpdate,
    customer: CurrentCustomer,
    session: Session,
) -> ProfileDetailsRead:
    details = await get_or_create_profile(customer, session)
    details.first_name = payload.first_name.strip()
    details.last_name = payload.last_name.strip()
    customer.full_name = f"{details.first_name} {details.last_name}".strip()
    await session.commit()
    await session.refresh(customer)
    return await serialize_profile(customer, session)


@router.post("/profile/email/start", status_code=status.HTTP_202_ACCEPTED)
async def start_email_link(
    payload: ProfileEmailStart,
    customer: CurrentCustomer,
    session: Session,
) -> dict[str, str]:
    email = str(payload.email).lower()
    existing = await session.scalar(
        select(Customer.id).where(Customer.email == email, Customer.id != customer.id)
    )
    if existing is not None:
        raise HTTPException(status_code=409, detail="Email is already linked to another account")

    details = await get_or_create_profile(customer, session)
    details.pending_email = email
    raw = secrets.token_urlsafe(32)
    session.add(
        AccountToken(
            customer_id=customer.id,
            token_hash=hashlib.sha256(raw.encode()).hexdigest(),
            purpose="link-email",
            expires_at=datetime.now(UTC) + timedelta(hours=2),
        )
    )
    settings = get_settings()
    link = (
        f"{settings.frontend_url.rstrip('/')}/{payload.locale}/account/reset"
        f"?purpose=link-email&token={raw}"
    )
    session.add(
        EmailOutbox(
            recipient=email,
            subject="Confirm your Xvond Store email",
            body=(
                "Confirm this email address for your Xvond Store account using the secure link below:\n\n"
                f"{link}\n\nThis link expires in two hours."
            ),
        )
    )
    await session.commit()
    return {"status": "verification-sent"}


@router.post("/profile/email/confirm")
async def confirm_email_link(payload: TokenRequest, session: Session) -> dict[str, str]:
    token = await session.scalar(
        select(AccountToken)
        .where(
            AccountToken.token_hash == hashlib.sha256(payload.token.encode()).hexdigest(),
            AccountToken.purpose == "link-email",
        )
        .with_for_update()
    )
    now = datetime.now(UTC)
    if token is None or token.used_at is not None or token.expires_at < now:
        raise HTTPException(status_code=422, detail="Token is invalid or expired")
    customer = await session.get(Customer, token.customer_id)
    if customer is None:
        raise HTTPException(status_code=422, detail="Token is invalid")
    details = await session.scalar(
        select(CustomerProfile).where(CustomerProfile.customer_id == customer.id).with_for_update()
    )
    if details is None or not details.pending_email:
        raise HTTPException(status_code=422, detail="No pending email change")
    conflict = await session.scalar(
        select(Customer.id).where(
            Customer.email == details.pending_email,
            Customer.id != customer.id,
        )
    )
    if conflict is not None:
        raise HTTPException(status_code=409, detail="Email is already linked to another account")

    customer.email = details.pending_email
    customer.email_verified = True
    details.pending_email = None
    token.used_at = now
    await session.commit()
    return {"status": "email-linked"}


@router.post("/profile/phone/start", status_code=status.HTTP_202_ACCEPTED)
async def start_phone_link(
    payload: ProfilePhoneStart,
    customer: CurrentCustomer,
    session: Session,
) -> dict[str, str]:
    settings = get_settings()
    if not settings.phone_auth_enabled:
        raise HTTPException(status_code=503, detail="Phone verification is not configured")
    phone = normalize_oman_phone(payload.phone)
    existing = await session.scalar(
        select(Customer.id).where(Customer.phone == phone, Customer.id != customer.id)
    )
    if existing is not None:
        raise HTTPException(status_code=409, detail="Phone is already linked to another account")
    identity = await session.scalar(
        select(AuthIdentity.id).where(
            AuthIdentity.provider == "phone",
            AuthIdentity.subject == phone,
            AuthIdentity.customer_id != customer.id,
        )
    )
    if identity is not None:
        raise HTTPException(status_code=409, detail="Phone is already linked to another account")

    url = (
        f"https://verify.twilio.com/v2/Services/{settings.twilio_verify_service_sid}"
        "/Verifications"
    )
    async with httpx.AsyncClient(timeout=15) as client:
        response = await client.post(
            url,
            auth=(settings.twilio_account_sid or "", settings.twilio_auth_token or ""),
            data={"To": phone, "Channel": "sms", "Locale": payload.locale},
        )
    if not response.is_success:
        raise HTTPException(status_code=502, detail="Could not send verification code")
    return {"status": "sent", "phone": phone}


@router.post("/profile/phone/confirm", response_model=ProfileDetailsRead)
async def confirm_phone_link(
    payload: ProfilePhoneConfirm,
    customer: CurrentCustomer,
    session: Session,
) -> ProfileDetailsRead:
    settings = get_settings()
    if not settings.phone_auth_enabled:
        raise HTTPException(status_code=503, detail="Phone verification is not configured")
    phone = normalize_oman_phone(payload.phone)
    conflict = await session.scalar(
        select(Customer.id).where(Customer.phone == phone, Customer.id != customer.id)
    )
    if conflict is not None:
        raise HTTPException(status_code=409, detail="Phone is already linked to another account")

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

    other_identity = await session.scalar(
        select(AuthIdentity).where(
            AuthIdentity.provider == "phone",
            AuthIdentity.subject == phone,
            AuthIdentity.customer_id != customer.id,
        )
    )
    if other_identity is not None:
        raise HTTPException(status_code=409, detail="Phone is already linked to another account")

    if customer.phone and customer.phone != phone:
        old_identity = await session.scalar(
            select(AuthIdentity).where(
                AuthIdentity.customer_id == customer.id,
                AuthIdentity.provider == "phone",
                AuthIdentity.subject == customer.phone,
            )
        )
        if old_identity is not None:
            await session.delete(old_identity)

    customer.phone = phone
    identity = await session.scalar(
        select(AuthIdentity).where(
            AuthIdentity.customer_id == customer.id,
            AuthIdentity.provider == "phone",
            AuthIdentity.subject == phone,
        )
    )
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
    return await serialize_profile(customer, session)
