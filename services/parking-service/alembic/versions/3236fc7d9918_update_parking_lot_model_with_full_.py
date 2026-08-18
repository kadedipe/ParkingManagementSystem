"""Create parking lot and parking spot tables."""
from alembic import op
import sqlalchemy as sa

revision = "3236fc7d9918"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    parking_lot_type = sa.Enum(
        "STANDARD", "PREMIUM", "VALET", "EV_CHARGING", "MULTI_LEVEL",
        name="parkinglottype",
    )
    parking_lot_status = sa.Enum(
        "ACTIVE", "INACTIVE", "MAINTENANCE", "CLOSED",
        name="parkinglotstatus",
    )
    spot_type = sa.Enum(
        "STANDARD", "COMPACT", "HANDICAP", "EV_CHARGING", "PREMIUM", "VALET", "MOTORCYCLE", "LARGE",
        name="parkingspottype",
    )
    spot_status = sa.Enum(
        "AVAILABLE", "OCCUPIED", "RESERVED", "MAINTENANCE", "OUT_OF_SERVICE",
        name="parkingspotstatus",
    )

    op.create_table(
        "parking_lots",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("type", parking_lot_type, nullable=False),
        sa.Column("status", parking_lot_status, nullable=False),
        sa.Column("address", sa.JSON(), nullable=False),
        sa.Column("location", sa.JSON(), nullable=True),
        sa.Column("total_spots", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("available_spots", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("reserved_spots", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("base_price_per_hour", sa.Numeric(10, 2), nullable=False, server_default="0"),
        sa.Column("base_price_per_day", sa.Numeric(10, 2), nullable=True),
        sa.Column("base_price_per_month", sa.Numeric(10, 2), nullable=True),
        sa.Column("amenities", sa.JSON(), nullable=True),
        sa.Column("features", sa.JSON(), nullable=True),
        sa.Column("operating_hours", sa.JSON(), nullable=True),
        sa.Column("phone", sa.String(20), nullable=True),
        sa.Column("email", sa.String(255), nullable=True),
        sa.Column("website", sa.String(255), nullable=True),
        sa.Column("rating", sa.Float(), nullable=True),
        sa.Column("review_count", sa.Integer(), nullable=True),
        sa.Column("images", sa.JSON(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.Column("created_by", sa.UUID(), nullable=True),
        sa.Column("updated_by", sa.UUID(), nullable=True),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_parking_lots")),
    )
    op.create_index(op.f("ix_parking_lots_name"), "parking_lots", ["name"], unique=False)

    op.create_table(
        "parking_spots",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("parking_lot_id", sa.UUID(), nullable=False),
        sa.Column("number", sa.String(20), nullable=False),
        sa.Column("level", sa.Integer(), nullable=False, server_default="1"),
        sa.Column("type", spot_type, nullable=False),
        sa.Column("status", spot_status, nullable=False),
        sa.Column("width", sa.Float(), nullable=True),
        sa.Column("length", sa.Float(), nullable=True),
        sa.Column("height", sa.Float(), nullable=True),
        sa.Column("is_covered", sa.Boolean(), nullable=True),
        sa.Column("is_handicap", sa.Boolean(), nullable=True),
        sa.Column("is_ev_charging", sa.Boolean(), nullable=True),
        sa.Column("connector_type", sa.String(50), nullable=True),
        sa.Column("charging_power", sa.Integer(), nullable=True),
        sa.Column("charging_price", sa.Float(), nullable=True),
        sa.Column("vehicle_id", sa.UUID(), nullable=True),
        sa.Column("vehicle_plate", sa.String(20), nullable=True),
        sa.Column("reserved_until", sa.DateTime(), nullable=True),
        sa.Column("occupied_since", sa.DateTime(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["parking_lot_id"], ["parking_lots.id"], name=op.f("fk_parking_spots_parking_lot_id_parking_lots")),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_parking_spots")),
        sa.UniqueConstraint("parking_lot_id", "number", name="uq_parking_spots_lot_number"),
    )
    op.create_index(op.f("ix_parking_spots_parking_lot_id"), "parking_spots", ["parking_lot_id"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_parking_spots_parking_lot_id"), table_name="parking_spots")
    op.drop_table("parking_spots")
    op.drop_index(op.f("ix_parking_lots_name"), table_name="parking_lots")
    op.drop_table("parking_lots")
    for enum_name in ("parkingspotstatus", "parkingspottype", "parkinglotstatus", "parkinglottype"):
        op.execute(sa.text(f"DROP TYPE IF EXISTS {enum_name}"))
