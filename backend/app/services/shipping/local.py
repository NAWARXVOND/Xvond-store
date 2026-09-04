from decimal import Decimal

from app.models.shipping import ShippingRate


OMAN_GOVERNORATE_ALIASES = {
    "muscat": "muscat",
    "مسقط": "muscat",
    "dhofar": "dhofar",
    "ظفار": "dhofar",
    "musandam": "musandam",
    "مسندم": "musandam",
    "al buraimi": "al buraimi",
    "buraimi": "al buraimi",
    "البريمي": "al buraimi",
    "ad dakhiliyah": "ad dakhiliyah",
    "al dakhiliyah": "ad dakhiliyah",
    "dakhiliyah": "ad dakhiliyah",
    "الداخلية": "ad dakhiliyah",
    "north al batinah": "north al batinah",
    "al batinah north": "north al batinah",
    "شمال الباطنة": "north al batinah",
    "south al batinah": "south al batinah",
    "al batinah south": "south al batinah",
    "جنوب الباطنة": "south al batinah",
    "north ash sharqiyah": "north ash sharqiyah",
    "ash sharqiyah north": "north ash sharqiyah",
    "north al sharqiyah": "north ash sharqiyah",
    "شمال الشرقية": "north ash sharqiyah",
    "south ash sharqiyah": "south ash sharqiyah",
    "ash sharqiyah south": "south ash sharqiyah",
    "south al sharqiyah": "south ash sharqiyah",
    "جنوب الشرقية": "south ash sharqiyah",
    "al wusta": "al wusta",
    "wusta": "al wusta",
    "الوسطى": "al wusta",
    "ad dhahirah": "ad dhahirah",
    "al dhahirah": "ad dhahirah",
    "dhahirah": "ad dhahirah",
    "الظاهرة": "ad dhahirah",
}


def normalize_governorate(value: str) -> str:
    normalized = " ".join(value.strip().lower().split())
    return OMAN_GOVERNORATE_ALIASES.get(normalized, normalized)


def calculate_shipping_amount(
    rate_amount: Decimal, free_over: Decimal | None, merchandise_total: Decimal
) -> Decimal:
    if free_over is not None and merchandise_total >= free_over:
        return Decimal("0.000")
    return rate_amount


def shipping_amount(rate: ShippingRate, merchandise_total: Decimal) -> Decimal:
    return calculate_shipping_amount(rate.amount, rate.free_over, merchandise_total)
