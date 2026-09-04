from datetime import UTC, datetime

import pytest
from pydantic import ValidationError

from app.api.courier import ShipmentEventWrite, ShipmentWrite


def test_shipment_assignment_accepts_tracking_data() -> None:
    payload = ShipmentWrite(
        provider="zaajil",
        tracking_number="ZX-123",
        tracking_url="https://example.com/track/ZX-123",
        status="created",
    )
    assert payload.provider == "zaajil"
    assert payload.tracking_number == "ZX-123"


def test_shipment_event_accepts_cod_collection() -> None:
    payload = ShipmentEventWrite(
        event_code="delivered",
        label_ar="تم التسليم",
        label_en="Delivered",
        occurred_at=datetime.now(UTC),
        shipment_status="delivered",
        cod_status="collected",
    )
    assert payload.cod_status == "collected"


def test_invalid_cod_status_is_rejected() -> None:
    with pytest.raises(ValidationError):
        ShipmentEventWrite(
            event_code="delivered",
            label_ar="تم التسليم",
            label_en="Delivered",
            occurred_at=datetime.now(UTC),
            cod_status="unknown",
        )
