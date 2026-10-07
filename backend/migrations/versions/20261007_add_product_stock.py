"""Add tracked stock levels to products.

Revision ID: 20261007_product_stock
Revises: 20261006_wishlist
Create Date: 2026-10-07
"""
from alembic import op
import sqlalchemy as sa


revision = "20261007_product_stock"
down_revision = "20261006_wishlist"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column(
        "product",
        sa.Column("stock", sa.Integer(), nullable=False, server_default="0"),
    )


def downgrade():
    op.drop_column("product", "stock")
