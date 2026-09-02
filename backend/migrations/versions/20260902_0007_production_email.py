"""add durable production email outbox

Revision ID: 20260902_0007
Revises: 20260902_0006
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "20260902_0007"
down_revision: str | Sequence[str] | None = "20260902_0006"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "email_outbox",
        sa.Column("id", sa.Uuid(), primary_key=True),
        sa.Column("recipient", sa.String(320), nullable=False),
        sa.Column("subject", sa.String(300), nullable=False),
        sa.Column("body", sa.Text(), nullable=False),
        sa.Column("status", sa.String(20), server_default="pending", nullable=False),
        sa.Column("attempts", sa.Integer(), server_default="0", nullable=False),
        sa.Column("last_error", sa.String(500)),
        sa.Column("sent_at", sa.DateTime(timezone=True)),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_email_outbox_recipient", "email_outbox", ["recipient"])
    op.create_index("ix_email_outbox_status", "email_outbox", ["status"])


def downgrade() -> None:
    op.drop_table("email_outbox")
