from app.api.orders import new_order_number
from app.schemas.orders import CheckoutCreate


def test_order_number_has_public_prefix() -> None:
    number = new_order_number()
    assert number.startswith("XV-")
    assert len(number.split("-")) == 3


def test_checkout_payload_validation() -> None:
    payload = CheckoutCreate.model_validate(
        {
            "customer": {
                "fullName": "Nawar Test",
                "email": "customer@example.com",
                "phone": "+96890000000",
                "governorate": "Muscat",
                "city": "Muscat",
                "addressLine": "Building 10, Street 20",
            },
            "items": [{"product_slug": "midnight-signature-box", "quantity": 1}],
        }
    )
    assert payload.items[0].quantity == 1
