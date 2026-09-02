from abc import ABC, abstractmethod
from dataclasses import dataclass
from decimal import Decimal


@dataclass(frozen=True)
class ShippingQuote:
    service_code: str
    amount: Decimal
    currency: str
    estimated_days: tuple[int, int]


class ShippingProvider(ABC):
    """Contract for a future courier or local delivery provider."""

    @abstractmethod
    async def quote(
        self, destination: dict[str, str], weight_grams: int
    ) -> list[ShippingQuote]: ...

    @abstractmethod
    async def create_shipment(self, order_id: str) -> str: ...
