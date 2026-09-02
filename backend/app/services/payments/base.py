from abc import ABC, abstractmethod
from dataclasses import dataclass
from decimal import Decimal


@dataclass(frozen=True)
class PaymentRequest:
    order_id: str
    amount: Decimal
    currency: str
    return_url: str


class PaymentProvider(ABC):
    """Contract for a future Oman-compatible payment provider."""

    @abstractmethod
    async def create_payment(self, request: PaymentRequest) -> str: ...

    @abstractmethod
    async def verify_webhook(self, payload: bytes, signature: str) -> bool: ...
