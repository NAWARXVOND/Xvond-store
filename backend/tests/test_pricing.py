from decimal import Decimal

from app.services.pricing import included_vat, saving


def test_percentage_saving_is_rounded_for_omr() -> None:
    assert saving(Decimal("12.345"), "percentage", Decimal(10)) == Decimal("1.234")


def test_fixed_saving_never_exceeds_total() -> None:
    assert saving(Decimal("5.000"), "fixed", Decimal("8.000")) == Decimal("5.000")


def test_unknown_discount_type_is_safe() -> None:
    assert saving(Decimal("10.000"), "mystery", Decimal(5)) == Decimal("0.000")


def test_vat_is_zero_while_store_is_not_registered() -> None:
    assert included_vat(Decimal("10.500")) == Decimal("0.000")


def test_explicit_future_vat_rate_can_still_be_calculated() -> None:
    assert included_vat(Decimal("10.500"), Decimal("0.05")) == Decimal("0.500")


def test_included_vat_is_zero_for_non_positive_amount() -> None:
    assert included_vat(Decimal("0.000"), Decimal("0.05")) == Decimal("0.000")
