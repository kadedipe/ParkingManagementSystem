"""add user profile fields

Revision ID: c4a8d91e2f60
Revises: 8f4c2d1a7b30
Create Date: 2026-08-29
"""

from alembic import op
import sqlalchemy as sa

revision = "c4a8d91e2f60"
down_revision = "8f4c2d1a7b30"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column("users", sa.Column("address", sa.String(length=255), nullable=True))
    op.add_column("users", sa.Column("bio", sa.Text(), nullable=True))
    op.add_column("users", sa.Column("avatar", sa.Text(), nullable=True))


def downgrade():
    op.drop_column("users", "avatar")
    op.drop_column("users", "bio")
    op.drop_column("users", "address")
