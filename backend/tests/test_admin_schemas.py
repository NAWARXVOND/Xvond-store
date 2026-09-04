import pytest
from pydantic import ValidationError

from app.schemas.admin import (
    CategoryUpdate,
    CouponUpdate,
    CouponWrite,
    DiscountUpdate,
    DiscountWrite,
    VariantUpdate,
)


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


def test_category_update_supports_visibility_control() -> None:
    update = CategoryUpdate(name_en="Women", is_active=False)
    assert update.name_en == "Women"
    assert update.is_active is False


def test_coupon_update_supports_activation_and_limits() -> None:
    update = CouponUpdate(value="15", usage_limit=25, is_active=False)
    assert str(update.value) == "15"
    assert update.usage_limit == 25
    assert update.is_active is False


def test_discount_update_rejects_invalid_scope() -> None:
    with pytest.raises(ValidationError):
        DiscountUpdate(scope="customer")
