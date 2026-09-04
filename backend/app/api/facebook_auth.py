from typing import Annotated, Literal
from urllib.parse import urlencode

import httpx
from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import RedirectResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.accounts import set_session_cookie
from app.api.external_auth import account_redirect, customer_for_identity, state_token, verify_state
from app.core.config import get_settings
from app.core.database import get_session
from app.core.security import create_session

router = APIRouter(prefix="/auth/facebook", tags=["authentication"])
Session = Annotated[AsyncSession, Depends(get_session)]


@router.get("/status")
async def facebook_status() -> dict[str, bool]:
    return {"enabled": get_settings().facebook_auth_enabled}


@router.get("/start")
async def facebook_start(
    locale: Annotated[Literal["ar", "en"], Query()] = "ar",
) -> RedirectResponse:
    settings = get_settings()
    if not settings.facebook_auth_enabled:
        raise HTTPException(status_code=503, detail="Facebook sign-in is not configured")
    state = state_token("facebook", locale, settings)
    query = urlencode(
        {
            "client_id": settings.facebook_app_id,
            "redirect_uri": settings.facebook_redirect_uri,
            "response_type": "code",
            "scope": "email,public_profile",
            "state": state,
        }
    )
    version = settings.facebook_graph_version.strip("/")
    return RedirectResponse(f"https://www.facebook.com/{version}/dialog/oauth?{query}")


@router.get("/callback")
async def facebook_callback(code: str, state: str, session: Session) -> RedirectResponse:
    settings = get_settings()
    if not settings.facebook_auth_enabled:
        raise HTTPException(status_code=503, detail="Facebook sign-in is not configured")
    locale = verify_state(state, "facebook", settings)
    version = settings.facebook_graph_version.strip("/")

    async with httpx.AsyncClient(timeout=15) as client:
        token_response = await client.get(
            f"https://graph.facebook.com/{version}/oauth/access_token",
            params={
                "client_id": settings.facebook_app_id,
                "client_secret": settings.facebook_app_secret,
                "redirect_uri": settings.facebook_redirect_uri,
                "code": code,
            },
        )
        if not token_response.is_success:
            raise HTTPException(status_code=401, detail="Facebook authentication failed")
        access_token = token_response.json().get("access_token")
        if not access_token:
            raise HTTPException(status_code=401, detail="Facebook access token is missing")

        profile_response = await client.get(
            f"https://graph.facebook.com/{version}/me",
            params={"fields": "id,name,email", "access_token": access_token},
        )
        if not profile_response.is_success:
            raise HTTPException(status_code=401, detail="Facebook profile lookup failed")
        profile = profile_response.json()

    subject = str(profile.get("id") or "")
    email = str(profile.get("email") or "").lower()
    if not subject:
        raise HTTPException(status_code=401, detail="Facebook account data is incomplete")
    if not email:
        raise HTTPException(
            status_code=422,
            detail="Facebook did not provide an email address for this account",
        )

    customer = await customer_for_identity(
        session,
        provider="facebook",
        subject=subject,
        email=email,
        full_name=str(profile.get("name") or email.split("@", 1)[0]),
    )
    response = RedirectResponse(account_redirect(locale, settings), status_code=303)
    set_session_cookie(response, create_session(str(customer.id), "customer"))
    return response
