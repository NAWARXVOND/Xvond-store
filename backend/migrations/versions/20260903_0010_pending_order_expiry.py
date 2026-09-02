"""add pending order payment expiry

Revision ID: 20260903_0010
Revises: 20260903_0009
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "20260903_0010"
down_revision: str | Sequence[str] | None = "20260903_0009"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.add_column("orders", sa.Column("payment_expires_at", sa.DateTime(timezone=True)))
    op.create_index("ix_orders_payment_expires_at", "orders", ["payment_expires_at"])


def downgrade() -> None:
    op.drop_index("ix_orders_payment_expires_at", table_name="orders")
    op.drop_column("orders", "payment_expires_at")
