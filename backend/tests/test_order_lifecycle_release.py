import pytest

from app.models.commerce import Order
from app.services.order_lifecycle import release_order_inventory


@pytest.mark.asyncio
async def test_inventory_release_is_idempotent() -> None:
    order = Order(inventory_released=True)
    assert not await release_order_inventory(object(), order)  # type: ignore[arg-type]
