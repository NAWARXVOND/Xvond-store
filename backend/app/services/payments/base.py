from abc import ABC, abstractmethod
from dataclasses import dataclass
from decimal import Decimal


@dataclass(frozen=True)
class PaymentRequest:
    order_id: str
    amount: Decimal
    currency: str
    return_url: str
    webhook_url: str
    customer_name: str
    customer_email: str
    customer_phone: str
    locale: str = "en"


@dataclass(frozen=True)
class PaymentResult:
    provider_payment_id: str
    checkout_url: str
    status: str


class PaymentProvider(ABC):
    @abstractmethod
    async def create_payment(self, request: PaymentRequest) -> PaymentResult: ...

    @abstractmethod
    async def verify_webhook(self, payload: dict, signature: str) -> bool: ...
