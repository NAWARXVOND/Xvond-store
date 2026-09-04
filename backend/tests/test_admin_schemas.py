import pytest
from pydantic import ValidationError

from app.schemas.admin import CouponWrite, DiscountWrite, VariantUpdate


def test_coupon_normal_values_are_valid() -> None:
    coupon = CouponWrite(code="WELCOME10", discount_type="percentage", value="10")
    assert coupon.code == "WELCOME10"


def test_discount_rejects_unknown_scope() -> None:
    with pytest.raises(ValidationError):
        DiscountWrite(
            name="Invalid",
            discount_type="fixed",
            value="2",
            scope="customer",
        )


def test_variant_update_accepts_live_commerce_values() -> None:
    update = VariantUpdate(price="12.500", compare_at_price="15.000", stock_quantity=8)
    assert str(update.price) == "12.500"
    assert update.stock_quantity == 8


def test_variant_update_rejects_negative_stock() -> None:
    with pytest.raises(ValidationError):
        VariantUpdate(stock_quantity=-1)
