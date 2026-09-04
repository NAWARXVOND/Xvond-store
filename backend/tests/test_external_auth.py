import pytest
from fastapi import HTTPException

from app.api.external_auth import normalize_oman_phone, state_token, verify_state
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
