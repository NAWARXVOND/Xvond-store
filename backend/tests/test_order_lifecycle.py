from datetime import UTC, datetime, timedelta

from app.models.commerce import Order
from app.services.order_lifecycle import payment_window_open


def test_payment_window_is_open_before_expiry() -> None:
    now = datetime.now(UTC)
    order = Order(payment_expires_at=now + timedelta(minutes=1))
    assert payment_window_open(order, now)


def test_payment_window_is_closed_at_expiry() -> None:
    now = datetime.now(UTC)
    order = Order(payment_expires_at=now)
    assert not payment_window_open(order, now)


def test_legacy_order_without_expiry_remains_open() -> None:
    order = Order(payment_expires_at=None)
    assert payment_window_open(order)
