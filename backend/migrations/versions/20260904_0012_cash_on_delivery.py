"""add order payment method

Revision ID: 20260904_0012
Revises: 20260904_0011
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "20260904_0012"
down_revision: str | Sequence[str] | None = "20260904_0011"
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
