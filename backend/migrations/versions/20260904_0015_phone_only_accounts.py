"""allow phone-only customer accounts

Revision ID: 20260904_0015
Revises: 20260904_0014
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "20260904_0015"
down_revision: str | Sequence[str] | None = "20260904_0014"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.alter_column(
        "customers",
        "email",
        existing_type=sa.String(length=320),
        nullable=True,
    )


def downgrade() -> None:
    op.execute("DELETE FROM customers WHERE email IS NULL")
    op.alter_column(
        "customers",
        "email",
        existing_type=sa.String(length=320),
        nullable=False,
    )
