import hashlib
import hmac
from decimal import Decimal

import pytest
from pydantic import ValidationError

from app.api.payments import next_payment_status
from app.core.config import Settings
from app.models.commerce import PaymentStatus
from app.services.payments.tap import format_tap_amount, normalize_oman_phone, tap_webhook_hash


def test_omr_uses_three_decimal_places() -> None:
    assert format_tap_amount(Decimal(3), "OMR") == "3.000"


def test_oman_phone_is_normalized_for_tap() -> None:
    assert normalize_oman_phone("+968 9123 4567") == {
        "country_code": "968",
        "number": "91234567",
    }


def test_tap_webhook_hash_matches_documented_formula() -> None:
    payload = {
        "id": "chg_123",
        "amount": 4,
        "currency": "OMR",
        "status": "CAPTURED",
        "reference": {"gateway": "gw_1", "payment": "pay_1"},
        "transaction": {"created": "123456"},
    }
    secret = "sk_test_example"
    message = (
        "x_idchg_123x_amount4.000x_currencyOMR"
        "x_gateway_referencegw_1x_payment_referencepay_1"
        "x_statusCAPTUREDx_created123456"
    )
    expected = hmac.new(secret.encode(), message.encode(), hashlib.sha256).hexdigest()
    assert tap_webhook_hash(payload, secret) == expected


def test_captured_marks_payment_paid() -> None:
    assert next_payment_status(PaymentStatus.pending, "CAPTURED") == PaymentStatus.paid


def test_authorized_marks_unpaid_order_authorized() -> None:
    assert next_payment_status(PaymentStatus.pending, "AUTHORIZED") == PaymentStatus.authorized


def test_late_authorized_webhook_cannot_regress_paid_order() -> None:
    assert next_payment_status(PaymentStatus.paid, "AUTHORIZED") == PaymentStatus.paid


def test_late_failure_webhook_cannot_regress_paid_order() -> None:
    assert next_payment_status(PaymentStatus.paid, "FAILED") == PaymentStatus.paid


def test_production_requires_tap_credentials_when_enabled() -> None:
    with pytest.raises(ValidationError):
        Settings(
            app_env="production",
            database_url="postgresql+asyncpg://store:strong-password@postgres/xvond_store",
            admin_api_token="a" * 48,
            admin_password="a-very-strong-admin-password",
            session_secret="s" * 64,
            frontend_url="https://xvond.com/store",
            smtp_host="smtp.zoho.com",
            smtp_username="store@xvond.com",
            smtp_password="strong-mail-password",
            tap_enabled=True,
        )
