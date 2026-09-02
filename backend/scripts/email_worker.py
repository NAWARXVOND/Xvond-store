import asyncio
from datetime import UTC, datetime

from sqlalchemy import select

from app.core.database import SessionFactory
from app.models.commerce import EmailOutbox
from app.services.email import EmailDeliveryError, deliver


async def run() -> None:
    while True:
        async with SessionFactory() as session:
            message = await session.scalar(
                select(EmailOutbox)
                .where(EmailOutbox.status == "pending", EmailOutbox.attempts < 10)
                .order_by(EmailOutbox.created_at)
                .with_for_update(skip_locked=True)
            )
            if message is None:
                await asyncio.sleep(2)
                continue
            message.attempts += 1
            try:
                await deliver(message)
                message.status = "sent"
                message.sent_at = datetime.now(UTC)
                message.last_error = None
            except (EmailDeliveryError, OSError) as error:
                message.last_error = str(error)[:500]
                if message.attempts >= 10:
                    message.status = "failed"
            await session.commit()
            if message.status == "pending":
                await asyncio.sleep(30)


if __name__ == "__main__":
    asyncio.run(run())
