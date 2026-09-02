"""expand admin catalog and promotions

Revision ID: 20260902_0003
Revises: 20260902_0002
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "20260902_0003"
down_revision: str | Sequence[str] | None = "20260902_0002"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def timestamps() -> list[sa.Column]:
    return [
        sa.Column(
            "created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False
        ),
        sa.Column(
            "updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False
        ),
    ]


def upgrade() -> None:
    op.add_column("products", sa.Column("primary_image_url", sa.String(1000)))
    op.add_column("coupons", sa.Column("minimum_order_amount", sa.Numeric(12, 3)))
    op.add_column("coupons", sa.Column("usage_limit", sa.Integer()))
    op.add_column(
        "coupons", sa.Column("usage_count", sa.Integer(), server_default="0", nullable=False)
    )
    op.add_column("coupons", sa.Column("starts_at", sa.DateTime(timezone=True)))
    op.add_column("coupons", sa.Column("ends_at", sa.DateTime(timezone=True)))
    op.create_table(
        "discounts",
        sa.Column("id", sa.Uuid(), primary_key=True),
        sa.Column("name", sa.String(160), nullable=False),
        sa.Column("discount_type", sa.String(20), nullable=False),
        sa.Column("value", sa.Numeric(12, 3), nullable=False),
        sa.Column("scope", sa.String(20), nullable=False),
        sa.Column("scope_reference", sa.String(180)),
        sa.Column("starts_at", sa.DateTime(timezone=True)),
        sa.Column("ends_at", sa.DateTime(timezone=True)),
        sa.Column("is_active", sa.Boolean(), nullable=False),
        *timestamps(),
    )
    op.create_table(
        "store_settings",
        sa.Column("id", sa.Uuid(), primary_key=True),
        sa.Column("key", sa.String(100), nullable=False, unique=True),
        sa.Column("value", sa.Text(), nullable=False),
        *timestamps(),
    )
    op.create_index("ix_store_settings_key", "store_settings", ["key"])


def downgrade() -> None:
    op.drop_table("store_settings")
    op.drop_table("discounts")
    op.drop_column("coupons", "ends_at")
    op.drop_column("coupons", "starts_at")
    op.drop_column("coupons", "usage_count")
    op.drop_column("coupons", "usage_limit")
    op.drop_column("coupons", "minimum_order_amount")
    op.drop_column("products", "primary_image_url")
