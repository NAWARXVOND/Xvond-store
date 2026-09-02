from decimal import Decimal

from app.services.pricing import saving


def test_percentage_saving_is_rounded_for_omr() -> None:
    assert saving(Decimal("12.345"), "percentage", Decimal(10)) == Decimal("1.234")


def test_fixed_saving_never_exceeds_total() -> None:
    assert saving(Decimal("5.000"), "fixed", Decimal("8.000")) == Decimal("5.000")


def test_unknown_discount_type_is_safe() -> None:
    assert saving(Decimal("10.000"), "mystery", Decimal(5)) == Decimal("0.000")
