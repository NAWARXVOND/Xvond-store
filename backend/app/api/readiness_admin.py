from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.core.database import get_session
from app.core.security import require_admin
from app.models.commerce import Product, ProductVariant
from app.models.shipping import ShippingRate

router = APIRouter(
    prefix="/admin/launch-readiness",
    tags=["admin-readiness"],
    dependencies=[Depends(require_admin)],
)
Session = Annotated[AsyncSession, Depends(get_session)]


@router.get("")
async def launch_readiness(session: Session) -> dict[str, object]:
    settings = get_settings()
    active_products = await session.scalar(
        select(func.count(Product.id)).where(Product.is_active.is_(True))
    )
    stocked_variants = await session.scalar(
        select(func.count(ProductVariant.id)).where(ProductVariant.stock_quantity > 0)
    )
    shipping_rates = await session.scalar(
        select(func.count(ShippingRate.id)).where(ShippingRate.is_active.is_(True))
    )

    checks = [
        {
            "key": "catalog",
            "ready": bool(active_products and stocked_variants),
            "detail": f"{active_products or 0} active products, {stocked_variants or 0} stocked variants",
        },
        {
            "key": "shipping",
            "ready": bool(shipping_rates),
            "detail": f"{shipping_rates or 0} active delivery areas",
        },
        {
            "key": "email",
            "ready": bool(settings.smtp_host and settings.smtp_username and settings.smtp_password),
            "detail": "SMTP configured" if settings.smtp_host and settings.smtp_username and settings.smtp_password else "SMTP incomplete",
        },
        {
            "key": "payment",
            "ready": bool(
                settings.tap_enabled
                and settings.tap_secret_key
                and settings.tap_merchant_id
                and settings.tap_webhook_url
            ),
            "detail": "Tap enabled" if settings.tap_enabled else "Tap disabled",
        },
        {
            "key": "production",
            "ready": settings.app_env == "production" and settings.frontend_url.startswith("https://"),
            "detail": f"APP_ENV={settings.app_env}",
        },
    ]
    ready_count = sum(1 for check in checks if check["ready"])
    return {
        "ready": ready_count == len(checks),
        "ready_count": ready_count,
        "total_checks": len(checks),
        "checks": checks,
    }
