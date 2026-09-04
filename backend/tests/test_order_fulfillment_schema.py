from app.schemas.admin import OrderAdminRead


def test_order_admin_read_accepts_fulfillment_snapshot() -> None:
    order = OrderAdminRead.model_validate(
        {
            "id": "12345678-1234-5678-1234-567812345678",
            "order_number": "XV-260904-ABC123",
            "customer_name": "Test Customer",
            "customer_email": "customer@example.com",
            "customer_phone": "+96890000000",
            "shipping_country_code": "OM",
            "shipping_governorate": "Muscat",
            "shipping_city": "Muscat",
            "shipping_address_line": "Building 1, Street 2",
            "status": "pending",
            "payment_status": "pending",
            "currency": "OMR",
            "subtotal": "10.000",
            "discount_total": "0.000",
            "shipping_total": "1.000",
            "tax_total": "0.000",
            "grand_total": "11.000",
            "promotion_code": None,
            "created_at": "2026-09-04T12:00:00Z",
        }
    )
    assert order.customer_name == "Test Customer"
    assert order.shipping_governorate == "Muscat"
    assert str(order.grand_total) == "11.000"
