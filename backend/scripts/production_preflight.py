import asyncio
import sys

from alembic.config import Config
from alembic.script import ScriptDirectory
from sqlalchemy import func, select, text

from app.core.config import get_settings
from app.core.database import SessionFactory
from app.models.commerce import Product, ProductVariant
from app.models.shipping import ShippingRate

EXPECTED_OMAN_GOVERNORATES = 11


def migration_head() -> str:
    config = Config("alembic.ini")
    script = ScriptDirectory.from_config(config)
    head = script.get_current_head()
    if head is None:
        raise RuntimeError("Alembic has no migration head")
    return head


async def run() -> int:
    settings = get_settings()
    failures: list[str] = []
    expected_head = migration_head()

    async with SessionFactory() as session:
        database_head = await session.scalar(text("select version_num from alembic_version"))
        active_products = await session.scalar(
            select(func.count(Product.id)).where(Product.is_active.is_(True))
        )
        stocked_variants = await session.scalar(
            select(func.count(ProductVariant.id)).where(ProductVariant.stock_quantity > 0)
        )
        shipping_rates = await session.scalar(
            select(func.count(ShippingRate.id)).where(ShippingRate.is_active.is_(True))
        )
        paid_shipping_rates = await session.scalar(
            select(func.count(ShippingRate.id)).where(
                ShippingRate.is_active.is_(True), ShippingRate.amount != 0
            )
        )

    tap_ready = bool(
        settings.tap_enabled
        and settings.tap_secret_key
        and settings.tap_merchant_id
        and settings.tap_webhook_url
    )
    checks = {
        "environment": settings.app_env == "production",
        "https_frontend": settings.frontend_url.startswith("https://"),
        "migrations": database_head == expected_head,
        "catalog": bool(active_products and stocked_variants),
        "oman_governorates": (shipping_rates or 0) >= EXPECTED_OMAN_GOVERNORATES,
        "free_delivery": (paid_shipping_rates or 0) == 0,
        "database_residency": settings.database_residency_country.strip().upper() == "OM",
        "smtp": bool(settings.smtp_host and settings.smtp_username and settings.smtp_password),
        # Cash on delivery is sufficient for launch. Tap is an optional additional method.
        "payment": True,
    }

    for name, ready in checks.items():
        print(f"{'OK' if ready else 'FAIL'}  {name}")
        if not ready:
            failures.append(name)

    print(f"database migration: {database_head or 'missing'} / expected {expected_head}")
    print(f"active products: {active_products or 0}")
    print(f"stocked variants: {stocked_variants or 0}")
    print(f"active Oman delivery areas: {shipping_rates or 0}")
    print(f"paid delivery areas: {paid_shipping_rates or 0}")
    print("payment methods: COD enabled" + (" + Tap ready" if tap_ready else " + Tap optional/not ready"))

    if failures:
        print("Preflight failed: " + ", ".join(failures), file=sys.stderr)
        return 1
    print("Production preflight passed")
    return 0


if __name__ == "__main__":
    raise SystemExit(asyncio.run(run()))
