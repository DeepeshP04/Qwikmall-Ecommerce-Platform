"""Add product brand and longer descriptions.

Revision ID: 20261007_product_details
Revises: 20261007_ecommerce_ops
Create Date: 2026-10-07
"""
from alembic import op
import sqlalchemy as sa


revision = "20261007_product_details"
down_revision = "20261007_ecommerce_ops"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column(
        "product",
        sa.Column("brand", sa.String(length=50), nullable=False, server_default=""),
    )
    op.alter_column(
        "product",
        "description",
        existing_type=sa.String(length=100),
        type_=sa.String(length=2000),
        existing_nullable=False,
    )


def downgrade():
    op.alter_column(
        "product",
        "description",
        existing_type=sa.String(length=2000),
        type_=sa.String(length=100),
        existing_nullable=False,
    )
    op.drop_column("product", "brand")
