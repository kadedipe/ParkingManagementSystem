"""add billing adjustments

Revision ID: e8c1a4f9d230
Revises: d7a91b4e6c20
Create Date: 2026-08-30
"""

from alembic import op
import sqlalchemy as sa

revision = "e8c1a4f9d230"
down_revision = "d7a91b4e6c20"
branch_labels = None
depends_on = None


def upgrade():
    adjustment_type = sa.Enum("OVERAGE", "CREDIT", "NONE", name="billingadjustmenttype")
    adjustment_status = sa.Enum("SETTLED", "PENDING", "FAILED", name="billingadjustmentstatus")

    op.create_table(
        "billing_adjustments",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("user_id", sa.UUID(), nullable=False),
        sa.Column("reservation_id", sa.UUID(), nullable=False),
        sa.Column("parking_session_id", sa.UUID(), nullable=False),
        sa.Column("payment_id", sa.UUID(), nullable=True),
        sa.Column("adjustment_type", adjustment_type, nullable=False),
        sa.Column("status", adjustment_status, nullable=False),
        sa.Column("reserved_amount", sa.Float(), nullable=False),
        sa.Column("actual_amount", sa.Float(), nullable=False),
        sa.Column("adjustment_amount", sa.Float(), nullable=False),
        sa.Column("currency", sa.String(length=3), nullable=False),
        sa.Column("provider_reference", sa.String(length=255), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("settled_at", sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(["parking_session_id"], ["parking_sessions.id"]),
        sa.ForeignKeyConstraint(["payment_id"], ["payments.id"]),
        sa.ForeignKeyConstraint(["reservation_id"], ["reservations.id"]),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("parking_session_id", name="uq_billing_adjustments_parking_session_id"),
    )
    op.create_index("ix_billing_adjustments_user_id", "billing_adjustments", ["user_id"], unique=False)
    op.create_index("ix_billing_adjustments_reservation_id", "billing_adjustments", ["reservation_id"], unique=False)
    op.create_index("ix_billing_adjustments_payment_id", "billing_adjustments", ["payment_id"], unique=False)
    op.create_index("ix_billing_adjustments_parking_session_id", "billing_adjustments", ["parking_session_id"], unique=True)


def downgrade():
    op.drop_index("ix_billing_adjustments_parking_session_id", table_name="billing_adjustments")
    op.drop_index("ix_billing_adjustments_payment_id", table_name="billing_adjustments")
    op.drop_index("ix_billing_adjustments_reservation_id", table_name="billing_adjustments")
    op.drop_index("ix_billing_adjustments_user_id", table_name="billing_adjustments")
    op.drop_table("billing_adjustments")
    sa.Enum(name="billingadjustmentstatus").drop(op.get_bind(), checkfirst=True)
    sa.Enum(name="billingadjustmenttype").drop(op.get_bind(), checkfirst=True)
