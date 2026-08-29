"""harden payment persistence

Revision ID: d7a91b4e6c20
Revises: c4a8d91e2f60
Create Date: 2026-08-29
"""

from alembic import op

revision = "d7a91b4e6c20"
down_revision = "c4a8d91e2f60"
branch_labels = None
depends_on = None


def upgrade():
    op.create_unique_constraint(
        "uq_payments_reservation_id",
        "payments",
        ["reservation_id"],
    )
    op.create_index("ix_payments_user_id", "payments", ["user_id"], unique=False)
    op.create_index("ix_payments_status", "payments", ["status"], unique=False)
    op.create_index("ix_payments_created_at", "payments", ["created_at"], unique=False)


def downgrade():
    op.drop_index("ix_payments_created_at", table_name="payments")
    op.drop_index("ix_payments_status", table_name="payments")
    op.drop_index("ix_payments_user_id", table_name="payments")
    op.drop_constraint("uq_payments_reservation_id", "payments", type_="unique")
