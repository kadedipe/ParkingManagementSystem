"""Add persistent parking sessions and merge existing migration heads.

Revision ID: 8f4c2d1a7b30
Revises: 3236fc7d9918, 51d8c3976050
"""

from alembic import op
import sqlalchemy as sa

revision = "8f4c2d1a7b30"
down_revision = ("3236fc7d9918", "51d8c3976050")
branch_labels = None
depends_on = None


def upgrade() -> None:
    session_status = sa.Enum(
        "ACTIVE", "COMPLETED", "CANCELLED",
        name="parkingsessionstatus",
    )

    op.create_table(
        "parking_sessions",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("user_id", sa.UUID(), nullable=False),
        sa.Column("reservation_id", sa.UUID(), nullable=False),
        sa.Column("parking_spot_id", sa.UUID(), nullable=False),
        sa.Column("vehicle_id", sa.UUID(), nullable=True),
        sa.Column("status", session_status, nullable=False),
        sa.Column("start_time", sa.DateTime(), nullable=False),
        sa.Column("end_time", sa.DateTime(), nullable=True),
        sa.Column("duration_minutes", sa.Float(), nullable=True),
        sa.Column("hourly_rate", sa.Float(), nullable=False),
        sa.Column("total_amount", sa.Float(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(
            ["parking_spot_id"], ["parking_spots.id"],
            name=op.f("fk_parking_sessions_parking_spot_id_parking_spots"),
        ),
        sa.ForeignKeyConstraint(
            ["reservation_id"], ["reservations.id"],
            name=op.f("fk_parking_sessions_reservation_id_reservations"),
        ),
        sa.ForeignKeyConstraint(
            ["user_id"], ["users.id"],
            name=op.f("fk_parking_sessions_user_id_users"),
        ),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_parking_sessions")),
    )
    op.create_index(op.f("ix_parking_sessions_user_id"), "parking_sessions", ["user_id"])
    op.create_index(op.f("ix_parking_sessions_reservation_id"), "parking_sessions", ["reservation_id"])
    op.create_index(op.f("ix_parking_sessions_parking_spot_id"), "parking_sessions", ["parking_spot_id"])
    op.create_index(op.f("ix_parking_sessions_status"), "parking_sessions", ["status"])
    op.create_index(op.f("ix_parking_sessions_start_time"), "parking_sessions", ["start_time"])
    op.create_index(op.f("ix_parking_sessions_end_time"), "parking_sessions", ["end_time"])


def downgrade() -> None:
    op.drop_index(op.f("ix_parking_sessions_end_time"), table_name="parking_sessions")
    op.drop_index(op.f("ix_parking_sessions_start_time"), table_name="parking_sessions")
    op.drop_index(op.f("ix_parking_sessions_status"), table_name="parking_sessions")
    op.drop_index(op.f("ix_parking_sessions_parking_spot_id"), table_name="parking_sessions")
    op.drop_index(op.f("ix_parking_sessions_reservation_id"), table_name="parking_sessions")
    op.drop_index(op.f("ix_parking_sessions_user_id"), table_name="parking_sessions")
    op.drop_table("parking_sessions")
    sa.Enum(name="parkingsessionstatus").drop(op.get_bind(), checkfirst=True)
