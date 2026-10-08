"""Add admin category, review moderation, and store settings support.

Revision ID: 20261008_admin_catalog
Revises: 20261007_product_details
Create Date: 2026-10-08
"""
from alembic import op
import sqlalchemy as sa


revision = "20261008_admin_catalog"
down_revision = "20261007_product_details"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column(
        "review",
        sa.Column("is_approved", sa.Boolean(), nullable=False, server_default=sa.true()),
    )
    op.create_table(
        "store_settings",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("data", sa.JSON(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )


def downgrade():
    op.drop_table("store_settings")
    op.drop_column("review", "is_approved")
