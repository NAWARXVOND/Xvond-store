from types import SimpleNamespace
from unittest.mock import AsyncMock

import pytest
from fastapi import HTTPException, Response

import app.api.external_auth as external_auth
from app.api.external_auth import (
    PhoneVerifyRequest,
    normalize_oman_phone,
    phone_verify,
    state_token,
    verify_state,
)
from app.core.config import Settings


def test_oman_phone_normalization() -> None:
    assert normalize_oman_phone("91234567") == "+96891234567"
    assert normalize_oman_phone("+968 9123 4567") == "+96891234567"


def test_non_oman_phone_is_rejected() -> None:
    with pytest.raises(HTTPException):
        normalize_oman_phone("+971501234567")


def test_oauth_state_round_trip() -> None:
    settings = Settings(session_secret="x" * 40)
    token = state_token("google", "ar", settings)
    assert verify_state(token, "google", settings) == "ar"


def test_auth_provider_flags_require_complete_credentials() -> None:
    settings = Settings(google_client_id="client", google_client_secret="secret")
    assert settings.google_auth_enabled is False
    assert settings.apple_auth_enabled is False
    assert settings.phone_auth_enabled is False


class _ApprovedVerificationResponse:
    is_success = True

    @staticmethod
    def json() -> dict[str, str]:
        return {"status": "approved"}


class _FakeHttpClient:
    async def __aenter__(self):
        return self

    async def __aexit__(self, exc_type, exc, tb):
        return False

    async def post(self, *args, **kwargs):
        return _ApprovedVerificationResponse()


@pytest.mark.asyncio
async def test_phone_verification_cannot_claim_an_existing_email(monkeypatch) -> None:
    monkeypatch.setattr(
        external_auth,
        "get_settings",
        lambda: Settings(
            twilio_account_sid="AC123",
            twilio_auth_token="secret",
            twilio_verify_service_sid="VA123",
        ),
    )
    monkeypatch.setattr(external_auth.httpx, "AsyncClient", lambda *args, **kwargs: _FakeHttpClient())

    existing_email_owner = SimpleNamespace(is_active=True)
    session = SimpleNamespace(scalar=AsyncMock(side_effect=[None, existing_email_owner]))

    with pytest.raises(HTTPException) as error:
        await phone_verify(
            PhoneVerifyRequest(
                phone="91234567",
                code="123456",
                email="owner@example.com",
                full_name="Attacker",
            ),
            Response(),
            session,
        )

    assert error.value.status_code == 409
    assert error.value.detail == "email_already_registered"


@pytest.mark.asyncio
async def test_phone_verification_rejects_inactive_accounts(monkeypatch) -> None:
    monkeypatch.setattr(
        external_auth,
        "get_settings",
        lambda: Settings(
            twilio_account_sid="AC123",
            twilio_auth_token="secret",
            twilio_verify_service_sid="VA123",
        ),
    )
    monkeypatch.setattr(external_auth.httpx, "AsyncClient", lambda *args, **kwargs: _FakeHttpClient())

    inactive_customer = SimpleNamespace(is_active=False)
    session = SimpleNamespace(scalar=AsyncMock(return_value=inactive_customer))

    with pytest.raises(HTTPException) as error:
        await phone_verify(
            PhoneVerifyRequest(phone="91234567", code="123456"),
            Response(),
            session,
        )

    assert error.value.status_code == 401
    assert error.value.detail == "Account is unavailable"
