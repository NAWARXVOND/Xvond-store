import base64
import hashlib
import hmac
import json
import time
from typing import Annotated, Literal
from urllib.parse import urlencode

import httpx
import jwt
from fastapi import APIRouter, Depends, HTTPException, Query, Request, Response, status
from fastapi.responses import RedirectResponse
from jwt import PyJWKClient
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy import or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.accounts import set_session_cookie
from app.core.config import Settings, get_settings
from app.core.database import get_session
from app.core.security import create_session
from app.models.commerce import Customer
from app.models.integrations import AuthIdentity

router = APIRouter(prefix="/auth", tags=["authentication"])
Session = Annotated[AsyncSession, Depends(get_session)]


class PhoneStartRequest(BaseModel):
    phone: str = Field(min_length=8, max_length=20)
    locale: Literal["ar", "en"] = "ar"


class PhoneVerifyRequest(BaseModel):
    phone: str = Field(min_length=8, max_length=20)
    code: str = Field(min_length=4, max_length=10)
    email: EmailStr | None = None
    full_name: str | None = Field(default=None, min_length=2, max_length=180)


def normalize_oman_phone(value: str) -> str:
    digits = "".join(character for character in value if character.isdigit())
    if digits.startswith("968") and len(digits) == 11:
        return f"+{digits}"
    if len(digits) == 8:
        return f"+968{digits}"
    raise HTTPException(status_code=422, detail="Use a valid Oman phone number")


def state_token(provider: str, locale: str, settings: Settings) -> str:
    payload = {"provider": provider, "locale": locale, "iat": int(time.time())}
    raw = json.dumps(payload, separators=(",", ":")).encode()
    encoded = base64.urlsafe_b64encode(raw).decode().rstrip("=")
    signature = hmac.new(settings.session_secret.encode(), encoded.encode(), hashlib.sha256).hexdigest()
    return f"{encoded}.{signature}"


def verify_state(value: str, provider: str, settings: Settings) -> str:
    try:
        encoded, signature = value.split(".", 1)
        expected = hmac.new(
            settings.session_secret.encode(), encoded.encode(), hashlib.sha256
        ).hexdigest()
        if not hmac.compare_digest(signature, expected):
            raise ValueError
        padded = encoded + "=" * (-len(encoded) % 4)
        payload = json.loads(base64.urlsafe_b64decode(padded))
        if payload.get("provider") != provider:
            raise ValueError
        if int(time.time()) - int(payload.get("iat", 0)) > 600:
            raise ValueError
        locale = payload.get("locale")
        if locale not in {"ar", "en"}:
            raise ValueError
        return str(locale)
    except (ValueError, TypeError, KeyError, json.JSONDecodeError) as exc:
        raise HTTPException(status_code=400, detail="Invalid or expired authentication state") from exc


async def customer_for_identity(
    session: AsyncSession,
    *,
    provider: str,
    subject: str,
    email: str | None = None,
    phone: str | None = None,
    full_name: str | None = None,
) -> Customer:
    identity = await session.scalar(
        select(AuthIdentity).where(
            AuthIdentity.provider == provider,
            AuthIdentity.subject == subject,
        )
    )
    if identity is not None:
        customer = await session.get(Customer, identity.customer_id)
        if customer is None or not customer.is_active:
            raise HTTPException(status_code=401, detail="Account is unavailable")
        return customer

    customer: Customer | None = None
    if email:
        customer = await session.scalar(select(Customer).where(Customer.email == email.lower()))
    if customer is None and phone:
        customer = await session.scalar(select(Customer).where(Customer.phone == phone))
    if customer is None:
        if not email:
            raise HTTPException(
                status_code=409,
                detail="An email address is required to create the account after phone verification",
            )
        customer = Customer(
            email=email.lower(),
            phone=phone,
            full_name=full_name or email.split("@", 1)[0],
        )
        session.add(customer)
        await session.flush()
    else:
        if phone and customer.phone is None:
            customer.phone = phone
        if full_name and customer.full_name.strip().lower() in {"customer", "xvond member"}:
            customer.full_name = full_name

    session.add(
        AuthIdentity(
            customer_id=customer.id,
            provider=provider,
            subject=subject,
            email=email.lower() if email else None,
            phone=phone,
        )
    )
    await session.commit()
    await session.refresh(customer)
    return customer


def account_redirect(locale: str, settings: Settings) -> str:
    return f"{settings.frontend_url.rstrip('/')}/{locale}/account"


@router.get("/providers")
async def auth_providers() -> dict[str, bool]:
    settings = get_settings()
    return {
        "email": True,
        "phone": settings.phone_auth_enabled,
        "google": settings.google_auth_enabled,
        "apple": settings.apple_auth_enabled,
    }


@router.get("/google/start")
async def google_start(locale: Annotated[Literal["ar", "en"], Query()] = "ar") -> RedirectResponse:
    settings = get_settings()
    if not settings.google_auth_enabled:
        raise HTTPException(status_code=503, detail="Google sign-in is not configured")
    state = state_token("google", locale, settings)
    query = urlencode(
        {
            "client_id": settings.google_client_id,
            "redirect_uri": settings.google_redirect_uri,
            "response_type": "code",
            "scope": "openid email profile",
            "state": state,
            "prompt": "select_account",
        }
    )
    return RedirectResponse(f"https://accounts.google.com/o/oauth2/v2/auth?{query}")


@router.get("/google/callback")
async def google_callback(
    code: str,
    state: str,
    session: Session,
) -> RedirectResponse:
    settings = get_settings()
    if not settings.google_auth_enabled:
        raise HTTPException(status_code=503, detail="Google sign-in is not configured")
    locale = verify_state(state, "google", settings)
    async with httpx.AsyncClient(timeout=15) as client:
        token_response = await client.post(
            "https://oauth2.googleapis.com/token",
            data={
                "code": code,
                "client_id": settings.google_client_id,
                "client_secret": settings.google_client_secret,
                "redirect_uri": settings.google_redirect_uri,
                "grant_type": "authorization_code",
            },
        )
        if not token_response.is_success:
            raise HTTPException(status_code=401, detail="Google authentication failed")
        id_token = token_response.json().get("id_token")
        if not id_token:
            raise HTTPException(status_code=401, detail="Google identity token is missing")
        info_response = await client.get(
            "https://oauth2.googleapis.com/tokeninfo", params={"id_token": id_token}
        )
        if not info_response.is_success:
            raise HTTPException(status_code=401, detail="Google identity token is invalid")
        info = info_response.json()
    if info.get("aud") != settings.google_client_id or str(info.get("email_verified")).lower() != "true":
        raise HTTPException(status_code=401, detail="Google identity is not verified")
    email = str(info.get("email", "")).lower()
    subject = str(info.get("sub", ""))
    if not email or not subject:
        raise HTTPException(status_code=401, detail="Google account data is incomplete")
    customer = await customer_for_identity(
        session,
        provider="google",
        subject=subject,
        email=email,
        full_name=str(info.get("name") or email.split("@", 1)[0]),
    )
    response = RedirectResponse(account_redirect(locale, settings), status_code=303)
    set_session_cookie(response, create_session(str(customer.id), "customer"))
    return response


def apple_client_secret(settings: Settings) -> str:
    now = int(time.time())
    private_key = (settings.apple_private_key or "").replace("\\n", "\n")
    return jwt.encode(
        {
            "iss": settings.apple_team_id,
            "iat": now,
            "exp": now + 300,
            "aud": "https://appleid.apple.com",
            "sub": settings.apple_client_id,
        },
        private_key,
        algorithm="ES256",
        headers={"kid": settings.apple_key_id},
    )


@router.get("/apple/start")
async def apple_start(locale: Annotated[Literal["ar", "en"], Query()] = "ar") -> RedirectResponse:
    settings = get_settings()
    if not settings.apple_auth_enabled:
        raise HTTPException(status_code=503, detail="Apple sign-in is not configured")
    query = urlencode(
        {
            "client_id": settings.apple_client_id,
            "redirect_uri": settings.apple_redirect_uri,
            "response_type": "code id_token",
            "response_mode": "form_post",
            "scope": "name email",
            "state": state_token("apple", locale, settings),
        }
    )
    return RedirectResponse(f"https://appleid.apple.com/auth/authorize?{query}")


@router.post("/apple/callback")
async def apple_callback(request: Request, session: Session) -> RedirectResponse:
    settings = get_settings()
    if not settings.apple_auth_enabled:
        raise HTTPException(status_code=503, detail="Apple sign-in is not configured")
    form = await request.form()
    code = str(form.get("code") or "")
    state = str(form.get("state") or "")
    locale = verify_state(state, "apple", settings)
    if not code:
        raise HTTPException(status_code=401, detail="Apple authorization code is missing")
    async with httpx.AsyncClient(timeout=15) as client:
        token_response = await client.post(
            "https://appleid.apple.com/auth/token",
            data={
                "client_id": settings.apple_client_id,
                "client_secret": apple_client_secret(settings),
                "code": code,
                "grant_type": "authorization_code",
                "redirect_uri": settings.apple_redirect_uri,
            },
        )
        if not token_response.is_success:
            raise HTTPException(status_code=401, detail="Apple authentication failed")
        id_token = token_response.json().get("id_token")
    if not id_token:
        raise HTTPException(status_code=401, detail="Apple identity token is missing")
    key = PyJWKClient("https://appleid.apple.com/auth/keys").get_signing_key_from_jwt(id_token)
    claims = jwt.decode(
        id_token,
        key.key,
        algorithms=["RS256"],
        audience=settings.apple_client_id,
        issuer="https://appleid.apple.com",
    )
    email = str(claims.get("email") or "").lower()
    subject = str(claims.get("sub") or "")
    if not email or not subject:
        raise HTTPException(status_code=401, detail="Apple account data is incomplete")
    customer = await customer_for_identity(
        session,
        provider="apple",
        subject=subject,
        email=email,
        full_name=email.split("@", 1)[0],
    )
    response = RedirectResponse(account_redirect(locale, settings), status_code=303)
    set_session_cookie(response, create_session(str(customer.id), "customer"))
    return response


@router.post("/phone/start", status_code=status.HTTP_202_ACCEPTED)
async def phone_start(payload: PhoneStartRequest) -> dict[str, str]:
    settings = get_settings()
    if not settings.phone_auth_enabled:
        raise HTTPException(status_code=503, detail="Phone sign-in is not configured")
    phone = normalize_oman_phone(payload.phone)
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


@router.post("/phone/verify")
async def phone_verify(
    payload: PhoneVerifyRequest,
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

    existing = await session.scalar(
        select(Customer).where(or_(Customer.phone == phone, Customer.email == payload.email))
    )
    if existing is None and (payload.email is None or payload.full_name is None):
        raise HTTPException(
            status_code=409,
            detail="email_and_name_required_for_first_phone_signup",
        )
    email = str(payload.email).lower() if payload.email else (existing.email if existing else None)
    customer = await customer_for_identity(
        session,
        provider="phone",
        subject=phone,
        email=email,
        phone=phone,
        full_name=payload.full_name or (existing.full_name if existing else None),
    )
    set_session_cookie(response, create_session(str(customer.id), "customer"))
    return {"id": str(customer.id), "email": customer.email, "phone": customer.phone}
