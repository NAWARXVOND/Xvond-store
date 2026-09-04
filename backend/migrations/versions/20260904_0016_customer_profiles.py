"""add customer profiles

Revision ID: 20260904_0016
Revises: 20260904_0015
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "20260904_0016"
down_revision: str | Sequence[str] | None = "20260904_0015"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "customer_profiles",
        sa.Column("id", sa.Uuid(), primary_key=True),
        sa.Column("customer_id", sa.Uuid(), sa.ForeignKey("customers.id", ondelete="CASCADE"), nullable=False),
        sa.Column("first_name", sa.String(90)),
        sa.Column("last_name", sa.String(90)),
        sa.Column("pending_email", sa.String(320)),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.UniqueConstraint("customer_id"),
        sa.UniqueConstraint("pending_email"),
    )
    op.create_index("ix_customer_profiles_customer_id", "customer_profiles", ["customer_id"])
    op.create_index("ix_customer_profiles_pending_email", "customer_profiles", ["pending_email"])


def downgrade() -> None:
    op.drop_index("ix_customer_profiles_pending_email", table_name="customer_profiles")
    op.drop_index("ix_customer_profiles_customer_id", table_name="customer_profiles")
    op.drop_table("customer_profiles")
