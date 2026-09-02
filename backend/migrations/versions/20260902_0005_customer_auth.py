"""add customer authentication

Revision ID: 20260902_0005
Revises: 20260902_0004
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "20260902_0005"
down_revision: str | Sequence[str] | None = "20260902_0004"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.add_column("customers", sa.Column("password_hash", sa.String(300)))


def downgrade() -> None:
    op.drop_column("customers", "password_hash")
