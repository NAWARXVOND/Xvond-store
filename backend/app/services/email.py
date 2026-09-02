import asyncio
import smtplib
from email.message import EmailMessage
from email.utils import parseaddr

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.models.commerce import EmailOutbox


class EmailDeliveryError(RuntimeError):
    """Raised when a queued email cannot be delivered."""


def queue_account_link(session: AsyncSession, email: str, purpose: str, token: str) -> None:
    settings = get_settings()
    link = f"{settings.frontend_url}/ar/account/reset?purpose={purpose}&token={token}"
    if purpose == "verify-email":
        subject = "Confirm your Xvond Store email"
        body = f"Confirm your email address using this secure link:\n\n{link}\n\nThis link expires in two hours."
    else:
        subject = "Reset your Xvond Store password"
        body = f"Reset your password using this secure link:\n\n{link}\n\nThis link expires in two hours."
    session.add(EmailOutbox(recipient=email, subject=subject, body=body))


def queue_order_event(
    session: AsyncSession, email: str, order_number: str, order_status: str
) -> None:
    session.add(
        EmailOutbox(
            recipient=email,
            subject=f"Xvond Store order {order_number}",
            body=f"Your order {order_number} status is now: {order_status}.",
        )
    )


def _send(message: EmailOutbox) -> None:
    settings = get_settings()
    if not settings.smtp_host or not settings.smtp_username or not settings.smtp_password:
        raise EmailDeliveryError("SMTP is not configured")
    email = EmailMessage()
    email["From"] = settings.email_from
    email["To"] = message.recipient
    email["Subject"] = message.subject
    email.set_content(message.body)
    _, from_address = parseaddr(settings.email_from)
    with smtplib.SMTP(settings.smtp_host, settings.smtp_port, timeout=15) as client:
        if settings.smtp_starttls:
            client.starttls()
        client.login(settings.smtp_username, settings.smtp_password)
        client.send_message(email, from_addr=from_address or settings.smtp_username)


async def deliver(message: EmailOutbox) -> None:
    await asyncio.to_thread(_send, message)
