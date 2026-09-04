import pytest
from pydantic import ValidationError

from app.schemas.orders import CheckoutCreate


BASE_PAYLOAD = {
    "customer": {
        "fullName": "Test Customer",
        "email": "customer@example.com",
        "phone": "+96890000000",
        "governorate": "Muscat",
        "city": "Muscat",
        "addressLine": "Al Khuwair, Building 1",
    },
    "items": [{"product_slug": "sample-product", "quantity": 1}],
}


def test_checkout_accepts_cash_on_delivery() -> None:
    payload = CheckoutCreate.model_validate({**BASE_PAYLOAD, "payment_method": "cash_on_delivery"})
    assert payload.payment_method == "cash_on_delivery"


def test_checkout_accepts_tap() -> None:
    payload = CheckoutCreate.model_validate({**BASE_PAYLOAD, "payment_method": "tap"})
    assert payload.payment_method == "tap"


def test_checkout_rejects_unknown_payment_method() -> None:
    with pytest.raises(ValidationError):
        CheckoutCreate.model_validate({**BASE_PAYLOAD, "payment_method": "bank_transfer"})
