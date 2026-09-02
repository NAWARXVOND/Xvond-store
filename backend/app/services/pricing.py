from decimal import Decimal


def saving(amount: Decimal, discount_type: str, value: Decimal) -> Decimal:
    if amount <= 0 or value <= 0:
        return Decimal("0.000")
    if discount_type == "percentage":
        result = amount * min(value, Decimal(100)) / Decimal(100)
    elif discount_type == "fixed":
        result = min(amount, value)
    else:
        return Decimal("0.000")
    return result.quantize(Decimal("0.001"))
