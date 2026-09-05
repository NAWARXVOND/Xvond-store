import pytest
from pydantic import ValidationError

from app.core.config import Settings
from app.services.email import queue_order_event


class FakeSession:
    def __init__(self) -> None:
        self.items: list[object] = []

    def add(self, item: object) -> None:
        self.items.append(item)


def production_settings(**overrides) -> dict[str, object]:
    values: dict[str, object] = {
        "app_env": "production",
        "database_url": "postgresql+asyncpg://store:strong-password@postgres/xvond_store",
        "database_residency_country": "OM",
        "admin_api_token": "a" * 48,
        "admin_password": "strong-admin-password",
        "session_secret": "s" * 64,
        "frontend_url": "https://xvond.com/store",
        "smtp_host": "smtp.zoho.com",
        "smtp_username": "support@xvond.com",
        "smtp_password": "strong-smtp-password",
        "cors_origins": "https://xvond.com",
    }
    values.update(overrides)
    return values


def test_production_rejects_default_secrets() -> None:
    with pytest.raises(ValidationError):
        Settings(app_env="production")


def test_production_rejects_documented_placeholders() -> None:
    with pytest.raises(ValidationError):
        Settings(
            app_env="production",
            database_url="postgresql+asyncpg://xvond_store:REPLACE_PASSWORD@postgres/xvond_store",
            admin_api_token="REPLACE_WITH_RANDOM_48_CHARACTERS",
            admin_password="REPLACE_WITH_STRONG_PASSWORD",
            session_secret="REPLACE_WITH_RANDOM_64_CHARACTERS",
            frontend_url="https://xvond.com/store",
            smtp_host="smtp.zoho.com",
            smtp_username="REPLACE_WITH_ZOHO_MAILBOX",
            smtp_password="REPLACE_WITH_ZOHO_APP_PASSWORD",
        )


def test_production_rejects_non_oman_database_residency() -> None:
    with pytest.raises(ValidationError):
        Settings(**production_settings(database_residency_country="AE"))


def test_production_rejects_wildcard_cors() -> None:
    with pytest.raises(ValidationError):
        Settings(**production_settings(cors_origins="*"))


def test_production_rejects_insecure_cors_origin() -> None:
    with pytest.raises(ValidationError):
        Settings(**production_settings(cors_origins="http://xvond.com"))


def test_order_email_is_durably_queued() -> None:
    session = FakeSession()
    queue_order_event(session, "buyer@example.com", "XV-123", "confirmed")  # type: ignore[arg-type]
    message = session.items[0]
    assert message.recipient == "buyer@example.com"
    assert message.status is None or message.status == "pending"
