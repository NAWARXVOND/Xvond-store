"""complete customer account foundations

Revision ID: 20260902_0006
Revises: 20260902_0005
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "20260902_0006"
down_revision: str | Sequence[str] | None = "20260902_0005"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.add_column(
        "customers",
        sa.Column("email_verified", sa.Boolean(), server_default=sa.false(), nullable=False),
    )
    op.create_table(
        "wishlist_items",
        sa.Column("id", sa.Uuid(), primary_key=True),
        sa.Column("customer_id", sa.Uuid(), sa.ForeignKey("customers.id", ondelete="CASCADE"), nullable=False),
        sa.Column("product_id", sa.Uuid(), sa.ForeignKey("products.id", ondelete="CASCADE"), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.UniqueConstraint("customer_id", "product_id"),
    )
    op.create_index("ix_wishlist_items_customer_id", "wishlist_items", ["customer_id"])
    op.create_index("ix_wishlist_items_product_id", "wishlist_items", ["product_id"])
    op.create_table(
        "account_tokens",
        sa.Column("id", sa.Uuid(), primary_key=True),
        sa.Column("customer_id", sa.Uuid(), sa.ForeignKey("customers.id", ondelete="CASCADE"), nullable=False),
        sa.Column("token_hash", sa.String(64), nullable=False, unique=True),
        sa.Column("purpose", sa.String(30), nullable=False),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("used_at", sa.DateTime(timezone=True)),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_account_tokens_customer_id", "account_tokens", ["customer_id"])
    op.create_index("ix_account_tokens_token_hash", "account_tokens", ["token_hash"])
    op.create_index("ix_account_tokens_purpose", "account_tokens", ["purpose"])


def downgrade() -> None:
    op.drop_table("account_tokens")
    op.drop_table("wishlist_items")
    op.drop_column("customers", "email_verified")
