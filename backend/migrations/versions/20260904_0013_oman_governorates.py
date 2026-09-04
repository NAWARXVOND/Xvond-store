"""seed Oman governorates for launch delivery

Revision ID: 20260904_0013
Revises: 20260904_0012
"""

from collections.abc import Sequence
from decimal import Decimal
import uuid

import sqlalchemy as sa
from alembic import op

revision: str = "20260904_0013"
down_revision: str | Sequence[str] | None = "20260904_0012"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


GOVERNORATES = [
    ("muscat", "مسقط", "Muscat", 1, 3),
    ("dhofar", "ظفار", "Dhofar", 2, 5),
    ("musandam", "مسندم", "Musandam", 2, 5),
    ("al buraimi", "البريمي", "Al Buraimi", 2, 4),
    ("ad dakhiliyah", "الداخلية", "Ad Dakhiliyah", 1, 4),
    ("north al batinah", "شمال الباطنة", "North Al Batinah", 1, 4),
    ("south al batinah", "جنوب الباطنة", "South Al Batinah", 1, 4),
    ("north ash sharqiyah", "شمال الشرقية", "North Ash Sharqiyah", 2, 5),
    ("south ash sharqiyah", "جنوب الشرقية", "South Ash Sharqiyah", 2, 5),
    ("al wusta", "الوسطى", "Al Wusta", 2, 5),
    ("ad dhahirah", "الظاهرة", "Ad Dhahirah", 2, 5),
]


def upgrade() -> None:
    shipping_rates = sa.table(
        "shipping_rates",
        sa.column("id", sa.Uuid()),
        sa.column("governorate_key", sa.String()),
        sa.column("name_ar", sa.String()),
        sa.column("name_en", sa.String()),
        sa.column("amount", sa.Numeric(12, 3)),
        sa.column("free_over", sa.Numeric(12, 3)),
        sa.column("estimated_days_min", sa.Integer()),
        sa.column("estimated_days_max", sa.Integer()),
        sa.column("is_active", sa.Boolean()),
    )
    connection = op.get_bind()
    existing = {
        row[0]
        for row in connection.execute(sa.text("SELECT governorate_key FROM shipping_rates"))
    }
    rows = [
        {
            "id": uuid.uuid4(),
            "governorate_key": key,
            "name_ar": name_ar,
            "name_en": name_en,
            "amount": Decimal("0.000"),
            "free_over": None,
            "estimated_days_min": days_min,
            "estimated_days_max": days_max,
            "is_active": True,
        }
        for key, name_ar, name_en, days_min, days_max in GOVERNORATES
        if key not in existing
    ]
    if rows:
        op.bulk_insert(shipping_rates, rows)


def downgrade() -> None:
    keys = [item[0] for item in GOVERNORATES]
    op.execute(
        sa.text("DELETE FROM shipping_rates WHERE governorate_key = ANY(:keys)").bindparams(keys=keys)
    )
