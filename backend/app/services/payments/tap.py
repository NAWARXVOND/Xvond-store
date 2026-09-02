import hashlib
import hmac
import re
from decimal import Decimal

import httpx

from app.services.payments.base import PaymentProvider, PaymentRequest, PaymentResult

TAP_API_BASE = "https://api.tap.company/v2"
THREE_DECIMAL_CURRENCIES = {"BHD", "JOD", "KWD", "OMR"}


def format_tap_amount(amount: Decimal | str | float, currency: str) -> str:
    precision = 3 if currency.upper() in THREE_DECIMAL_CURRENCIES else 2
    return f"{Decimal(str(amount)):.{precision}f}"


def tap_webhook_hash(payload: dict, secret_key: str) -> str:
    reference = payload.get("reference") or {}
    transaction = payload.get("transaction") or {}
    currency = str(payload.get("currency") or "").upper()
    amount = format_tap_amount(payload.get("amount", 0), currency)
    message = (
        f"x_id{payload.get('id', '')}"
        f"x_amount{amount}"
        f"x_currency{currency}"
        f"x_gateway_reference{reference.get('gateway', '') or ''}"
        f"x_payment_reference{reference.get('payment', '') or ''}"
        f"x_status{payload.get('status', '')}"
        f"x_created{transaction.get('created', '') or payload.get('created', '')}"
    )
    return hmac.new(secret_key.encode(), message.encode(), hashlib.sha256).hexdigest()


def normalize_oman_phone(phone: str) -> dict[str, str]:
    digits = re.sub(r"\D", "", phone).removeprefix("968")
    return {"country_code": "968", "number": digits[-8:]}


class TapPaymentProvider(PaymentProvider):
    def __init__(self, *, secret_key: str, merchant_id: str, source_id: str = "src_all") -> None:
        self.secret_key = secret_key
        self.merchant_id = merchant_id
        self.source_id = source_id

    async def create_payment(self, request: PaymentRequest) -> PaymentResult:
        names = request.customer_name.strip().split(maxsplit=1)
        first_name = names[0]
        last_name = names[1] if len(names) > 1 else names[0]
        body = {
            "amount": float(request.amount),
            "currency": request.currency.upper(),
            "customer_initiated": True,
            "threeDSecure": True,
            "save_card": False,
            "description": f"Xvond Store {request.order_id}",
            "reference": {"transaction": request.order_id, "order": request.order_id},
            "customer": {
                "first_name": first_name,
                "last_name": last_name,
                "email": request.customer_email,
                "phone": normalize_oman_phone(request.customer_phone),
            },
            "merchant": {"id": self.merchant_id},
            "source": {"id": self.source_id},
            "post": {"url": request.webhook_url},
            "redirect": {"url": request.return_url},
        }
        headers = {
            "Authorization": f"Bearer {self.secret_key}",
            "Content-Type": "application/json",
            "lang_code": request.locale,
        }
        async with httpx.AsyncClient(timeout=20.0) as client:
            response = await client.post(f"{TAP_API_BASE}/charges/", json=body, headers=headers)
        response.raise_for_status()
        data = response.json()
        charge_id = data.get("id")
        checkout_url = (data.get("transaction") or {}).get("url")
        if not charge_id or not checkout_url:
            raise RuntimeError("Tap did not return a hosted payment URL")
        return PaymentResult(
            provider_payment_id=charge_id,
            checkout_url=checkout_url,
            status=str(data.get("status") or "INITIATED"),
        )

    async def verify_webhook(self, payload: dict, signature: str) -> bool:
        expected = tap_webhook_hash(payload, self.secret_key)
        return hmac.compare_digest(expected, signature)
