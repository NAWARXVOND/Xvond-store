from decimal import Decimal

OMAN_VAT_RATE = Decimal("0.05")
OMR_QUANTUM = Decimal("0.001")


def saving(amount: Decimal, discount_type: str, value: Decimal) -> Decimal:
    if amount <= 0 or value <= 0:
        return Decimal("0.000")
    if discount_type == "percentage":
        result = amount * min(value, Decimal(100)) / Decimal(100)
    elif discount_type == "fixed":
        result = min(amount, value)
    else:
        return Decimal("0.000")
    return result.quantize(OMR_QUANTUM)


def included_vat(amount_including_vat: Decimal, rate: Decimal = OMAN_VAT_RATE) -> Decimal:
    """Return the VAT component already included in a VAT-inclusive amount."""
    if amount_including_vat <= 0 or rate <= 0:
        return Decimal("0.000")
    tax = amount_including_vat * rate / (Decimal("1") + rate)
    return tax.quantize(OMR_QUANTUM)
