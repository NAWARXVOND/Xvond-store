import uuid
from decimal import Decimal

import pytest
from fastapi import HTTPException

from app.api.orders import line_totals, selected_variant
from app.models.commerce import Product, ProductVariant
from app.schemas.orders import CheckoutItem


def product_with_variants(*, stock_a: int = 3, stock_b: int = 5) -> tuple[Product, ProductVariant, ProductVariant]:
    product_id = uuid.uuid4()
    product = Product(
        id=product_id,
        slug="test-product",
        sku="TEST",
        name_ar="منتج اختبار",
        name_en="Test Product",
        description_ar=None,
        description_en=None,
        primary_image_url=None,
        category_id=uuid.uuid4(),
        is_active=True,
    )
    first = ProductVariant(
        id=uuid.uuid4(),
        product_id=product_id,
        sku="TEST-A",
        title_ar="الخيار أ",
        title_en="Option A",
        price=Decimal("10.000"),
        compare_at_price=None,
        stock_quantity=stock_a,
    )
    second = ProductVariant(
        id=uuid.uuid4(),
        product_id=product_id,
        sku="TEST-B",
        title_ar="الخيار ب",
        title_en="Option B",
        price=Decimal("20.000"),
        compare_at_price=None,
        stock_quantity=stock_b,
    )
    product.variants = [first, second]
    return product, first, second


def test_selected_variant_uses_explicit_variant() -> None:
    product, first, second = product_with_variants()
    requested = CheckoutItem(product_slug=product.slug, variant_id=second.id, quantity=1)
    assert selected_variant(requested, product) is second
    assert selected_variant(requested, product) is not first


def test_multi_variant_product_requires_selection() -> None:
    product, _, _ = product_with_variants()
    with pytest.raises(HTTPException) as exc:
        selected_variant(CheckoutItem(product_slug=product.slug, quantity=1), product)
    assert exc.value.status_code == 422


def test_variant_must_belong_to_product() -> None:
    product, _, _ = product_with_variants()
    requested = CheckoutItem(product_slug=product.slug, variant_id=uuid.uuid4(), quantity=1)
    with pytest.raises(HTTPException) as exc:
        selected_variant(requested, product)
    assert exc.value.status_code == 422


def test_duplicate_lines_share_the_same_stock_limit() -> None:
    product, first, _ = product_with_variants(stock_a=3)
    items = [
        CheckoutItem(product_slug=product.slug, variant_id=first.id, quantity=2),
        CheckoutItem(product_slug=product.slug, variant_id=first.id, quantity=2),
    ]
    with pytest.raises(HTTPException) as exc:
        line_totals(items, {product.slug: product})
    assert exc.value.status_code == 409


def test_two_variants_of_same_product_are_priced_separately() -> None:
    product, first, second = product_with_variants()
    items = [
        CheckoutItem(product_slug=product.slug, variant_id=first.id, quantity=2),
        CheckoutItem(product_slug=product.slug, variant_id=second.id, quantity=1),
    ]
    subtotal, totals = line_totals(items, {product.slug: product})
    assert subtotal == Decimal("40.000")
    assert totals[product.slug] == Decimal("40.000")
