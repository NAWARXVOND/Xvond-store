import logging

from app.core.config import get_settings

logger = logging.getLogger("xvond_store.email")


async def send_account_link(email: str, purpose: str, token: str) -> None:
    settings = get_settings()
    if settings.app_env == "production":
        logger.warning("Email provider is not configured for %s", purpose)
        return
    link = f"{settings.frontend_url}/ar/account/reset?purpose={purpose}&token={token}"
    logger.info("Development email to %s from %s: %s", email, settings.email_from, link)


async def send_order_event(email: str, order_number: str, order_status: str) -> None:
    settings = get_settings()
    if settings.app_env == "production":
        logger.warning("Email provider is not configured for order notifications")
        return
    logger.info(
        "Development order email to %s from %s: %s is %s",
        email,
        settings.email_from,
        order_number,
        order_status,
    )
