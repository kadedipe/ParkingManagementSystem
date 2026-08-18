from alembic import op
import sqlalchemy as sa

revision="0001_create_notifications"
down_revision=None
branch_labels=None
depends_on=None

def upgrade():
    op.create_table(
        "notifications",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("user_id", sa.UUID(), nullable=False),
        sa.Column("type", sa.String(50), nullable=False, server_default="general"),
        sa.Column("title", sa.String(255), nullable=False),
        sa.Column("message", sa.Text(), nullable=False),
        sa.Column("data", sa.JSON(), nullable=True),
        sa.Column("channels", sa.JSON(), nullable=True),
        sa.Column("priority", sa.String(20), nullable=False, server_default="normal"),
        sa.Column("status", sa.String(20), nullable=False, server_default="pending"),
        sa.Column("is_read", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("read_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("sent_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_notifications_user_id", "notifications", ["user_id"])
    op.create_index("ix_notifications_user_created", "notifications", ["user_id", "created_at"])
    op.create_table(
        "notification_preferences",
        sa.Column("user_id", sa.UUID(), nullable=False),
        sa.Column("email_enabled", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("push_enabled", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("sms_enabled", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.PrimaryKeyConstraint("user_id"),
    )

def downgrade():
    op.drop_table("notification_preferences")
    op.drop_index("ix_notifications_user_created", table_name="notifications")
    op.drop_index("ix_notifications_user_id", table_name="notifications")
    op.drop_table("notifications")
