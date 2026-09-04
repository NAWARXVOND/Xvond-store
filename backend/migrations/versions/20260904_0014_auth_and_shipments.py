"""add auth identities and shipment tracking

Revision ID: 20260904_0014
Revises: 20260904_0013
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "20260904_0014"
down_revision: str | Sequence[str] | None = "20260904_0013"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "auth_identities",
        sa.Column("id", sa.Uuid(), primary_key=True),
        sa.Column("customer_id", sa.Uuid(), sa.ForeignKey("customers.id", ondelete="CASCADE"), nullable=False),
        sa.Column("provider", sa.String(30), nullable=False),
        sa.Column("subject", sa.String(320), nullable=False),
        sa.Column("email", sa.String(320)),
        sa.Column("phone", sa.String(32)),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.UniqueConstraint("provider", "subject"),
    )
    op.create_index("ix_auth_identities_customer_id", "auth_identities", ["customer_id"])
    op.create_index("ix_auth_identities_provider", "auth_identities", ["provider"])
    op.create_index("ix_auth_identities_subject", "auth_identities", ["subject"])

    op.create_table(
        "shipments",
        sa.Column("id", sa.Uuid(), primary_key=True),
        sa.Column("order_id", sa.Uuid(), sa.ForeignKey("orders.id", ondelete="CASCADE"), nullable=False),
        sa.Column("provider", sa.String(60), nullable=False),
        sa.Column("external_id", sa.String(160)),
        sa.Column("tracking_number", sa.String(160)),
        sa.Column("tracking_url", sa.String(1000)),
        sa.Column("status", sa.String(40), server_default="created", nullable=False),
        sa.Column("cod_status", sa.String(40)),
        sa.Column("last_event_at", sa.DateTime(timezone=True)),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.UniqueConstraint("order_id"),
    )
    op.create_index("ix_shipments_order_id", "shipments", ["order_id"])
    op.create_index("ix_shipments_provider", "shipments", ["provider"])
    op.create_index("ix_shipments_external_id", "shipments", ["external_id"])
    op.create_index("ix_shipments_tracking_number", "shipments", ["tracking_number"])
    op.create_index("ix_shipments_status", "shipments", ["status"])
    op.create_index("ix_shipments_cod_status", "shipments", ["cod_status"])

    op.create_table(
        "shipment_events",
        sa.Column("id", sa.Uuid(), primary_key=True),
        sa.Column("shipment_id", sa.Uuid(), sa.ForeignKey("shipments.id", ondelete="CASCADE"), nullable=False),
        sa.Column("event_code", sa.String(60), nullable=False),
        sa.Column("label_ar", sa.String(200), nullable=False),
        sa.Column("label_en", sa.String(200), nullable=False),
        sa.Column("location", sa.String(200)),
        sa.Column("occurred_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("raw_reference", sa.Text()),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_shipment_events_shipment_id", "shipment_events", ["shipment_id"])
    op.create_index("ix_shipment_events_event_code", "shipment_events", ["event_code"])
    op.create_index("ix_shipment_events_occurred_at", "shipment_events", ["occurred_at"])


def downgrade() -> None:
    op.drop_table("shipment_events")
    op.drop_table("shipments")
    op.drop_table("auth_identities")
