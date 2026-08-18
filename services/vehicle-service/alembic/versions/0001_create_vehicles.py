from alembic import op
import sqlalchemy as sa

revision = "0001_create_vehicles"
down_revision = None
branch_labels = None
depends_on = None

def upgrade():
    op.create_table(
        "vehicles",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("user_id", sa.UUID(), nullable=False),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("plate_number", sa.String(32), nullable=False),
        sa.Column("vin", sa.String(17), nullable=True),
        sa.Column("color", sa.String(50), nullable=True),
        sa.Column("year", sa.Integer(), nullable=True),
        sa.Column("make", sa.String(100), nullable=True),
        sa.Column("model", sa.String(100), nullable=True),
        sa.Column("is_ev", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("battery_capacity", sa.Float(), nullable=True),
        sa.Column("connector_type", sa.String(50), nullable=True),
        sa.Column("max_charging_power", sa.Integer(), nullable=True),
        sa.Column("mileage", sa.Integer(), nullable=True),
        sa.Column("is_default", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("status", sa.String(20), nullable=False, server_default="active"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("user_id", "plate_number", name="uq_vehicles_user_plate"),
        sa.UniqueConstraint("vin", name="uq_vehicles_vin"),
    )
    op.create_index("ix_vehicles_user_id", "vehicles", ["user_id"])

def downgrade():
    op.drop_index("ix_vehicles_user_id", table_name="vehicles")
    op.drop_table("vehicles")
