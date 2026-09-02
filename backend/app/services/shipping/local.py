from decimal import Decimal

from app.models.shipping import ShippingRate


def normalize_governorate(value: str) -> str:
    return " ".join(value.strip().lower().split())


def calculate_shipping_amount(
    rate_amount: Decimal, free_over: Decimal | None, merchandise_total: Decimal
) -> Decimal:
    if free_over is not None and merchandise_total >= free_over:
        return Decimal("0.000")
    return rate_amount


def shipping_amount(rate: ShippingRate, merchandise_total: Decimal) -> Decimal:
    return calculate_shipping_amount(rate.amount, rate.free_over, merchandise_total)
