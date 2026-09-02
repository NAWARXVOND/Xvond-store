import pytest
from pydantic import ValidationError

from app.schemas.admin import CouponWrite, DiscountWrite


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
