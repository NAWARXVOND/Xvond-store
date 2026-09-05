from sqlalchemy import update
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.commerce import Customer, Order


async def claim_guest_orders_by_email(session: AsyncSession, customer: Customer) -> int:
    """Attach unclaimed guest orders only after the caller verifies email ownership."""
    if not customer.email or not customer.email_verified:
        return 0
    result = await session.execute(
        update(Order)
        .where(
            Order.customer_id.is_(None),
            Order.customer_email == customer.email.lower(),
        )
        .values(customer_id=customer.id)
    )
    return int(result.rowcount or 0)
