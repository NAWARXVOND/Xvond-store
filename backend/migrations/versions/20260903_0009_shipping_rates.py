"""add configurable shipping rates

Revision ID: 20260903_0009
Revises: 20260903_0008
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "20260903_0009"
down_revision: str | Sequence[str] | None = "20260903_0008"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "shipping_rates",
        sa.Column("id", sa.Uuid(), primary_key=True),
        sa.Column("governorate_key", sa.String(120), nullable=False),
        sa.Column("name_ar", sa.String(160), nullable=False),
        sa.Column("name_en", sa.String(160), nullable=False),
        sa.Column("amount", sa.Numeric(12, 3), nullable=False),
        sa.Column("free_over", sa.Numeric(12, 3)),
        sa.Column("estimated_days_min", sa.Integer(), server_default="1", nullable=False),
        sa.Column("estimated_days_max", sa.Integer(), server_default="3", nullable=False),
        sa.Column("is_active", sa.Boolean(), server_default=sa.true(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.UniqueConstraint("governorate_key"),
    )
    op.create_index("ix_shipping_rates_governorate_key", "shipping_rates", ["governorate_key"])
    op.create_index("ix_shipping_rates_is_active", "shipping_rates", ["is_active"])


def downgrade() -> None:
    op.drop_table("shipping_rates")
