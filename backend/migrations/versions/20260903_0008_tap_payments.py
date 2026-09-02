"""add payment attempts

Revision ID: 20260903_0008
Revises: 20260902_0007
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "20260903_0008"
down_revision: str | Sequence[str] | None = "20260902_0007"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "payment_attempts",
        sa.Column("id", sa.Uuid(), primary_key=True),
        sa.Column("order_id", sa.Uuid(), sa.ForeignKey("orders.id", ondelete="CASCADE"), nullable=False),
        sa.Column("provider", sa.String(30), nullable=False),
        sa.Column("provider_payment_id", sa.String(120), nullable=False, unique=True),
        sa.Column("status", sa.String(40), nullable=False),
        sa.Column("amount", sa.Numeric(12, 3), nullable=False),
        sa.Column("currency", sa.String(3), nullable=False),
        sa.Column("checkout_url", sa.String(1200)),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_payment_attempts_order_id", "payment_attempts", ["order_id"])
    op.create_index("ix_payment_attempts_provider", "payment_attempts", ["provider"])
    op.create_index("ix_payment_attempts_provider_payment_id", "payment_attempts", ["provider_payment_id"], unique=True)
    op.create_index("ix_payment_attempts_status", "payment_attempts", ["status"])


def downgrade() -> None:
    op.drop_table("payment_attempts")
