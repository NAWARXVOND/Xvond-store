"""track order promotions and inventory release

Revision ID: 20260902_0004
Revises: 20260902_0003
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "20260902_0004"
down_revision: str | Sequence[str] | None = "20260902_0003"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.add_column("orders", sa.Column("promotion_code", sa.String(60)))
    op.add_column(
        "orders",
        sa.Column("inventory_released", sa.Boolean(), server_default=sa.false(), nullable=False),
    )


def downgrade() -> None:
    op.drop_column("orders", "inventory_released")
    op.drop_column("orders", "promotion_code")
