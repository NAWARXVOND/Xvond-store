"""add order payment method

Revision ID: 0012_cash_on_delivery
Revises: 0011_order_fulfillment_snapshot
Create Date: 2026-09-04
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "0012_cash_on_delivery"
down_revision: str | None = "0011_order_fulfillment_snapshot"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.add_column(
        "orders",
        sa.Column("payment_method", sa.String(length=30), nullable=False, server_default="manual"),
    )
    op.create_index("ix_orders_payment_method", "orders", ["payment_method"], unique=False)


def downgrade() -> None:
    op.drop_index("ix_orders_payment_method", table_name="orders")
    op.drop_column("orders", "payment_method")
