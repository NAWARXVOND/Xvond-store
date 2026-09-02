import asyncio
import logging

from app.core.database import SessionLocal
from app.services.order_lifecycle import expire_due_orders

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("order-expiry-worker")


async def run() -> None:
    while True:
        try:
            async with SessionLocal() as session:
                expired = await expire_due_orders(session)
                if expired:
                    logger.info("Expired %s unpaid orders", expired)
        except Exception:
            logger.exception("Order expiry sweep failed")
        await asyncio.sleep(60)


if __name__ == "__main__":
    asyncio.run(run())
