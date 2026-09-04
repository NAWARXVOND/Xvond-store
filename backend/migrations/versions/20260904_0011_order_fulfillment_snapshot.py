"""add immutable order fulfillment snapshot

Revision ID: 20260904_0011
Revises: 20260903_0010
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "20260904_0011"
down_revision: str | Sequence[str] | None = "20260903_0010"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.add_column("orders", sa.Column("customer_name", sa.String(length=180)))
    op.add_column("orders", sa.Column("customer_email", sa.String(length=320)))
    op.add_column("orders", sa.Column("customer_phone", sa.String(length=32)))
    op.add_column(
        "orders",
        sa.Column("shipping_country_code", sa.String(length=2), nullable=False, server_default="OM"),
    )
    op.add_column("orders", sa.Column("shipping_governorate", sa.String(length=120)))
    op.add_column("orders", sa.Column("shipping_city", sa.String(length=120)))
    op.add_column("orders", sa.Column("shipping_address_line", sa.String(length=300)))


def downgrade() -> None:
    op.drop_column("orders", "shipping_address_line")
    op.drop_column("orders", "shipping_city")
    op.drop_column("orders", "shipping_governorate")
    op.drop_column("orders", "shipping_country_code")
    op.drop_column("orders", "customer_phone")
    op.drop_column("orders", "customer_email")
    op.drop_column("orders", "customer_name")
