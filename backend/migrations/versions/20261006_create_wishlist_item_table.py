"""Create persistent wishlist items.

Revision ID: 20261006_wishlist
Revises: f1dc80592cbc
Create Date: 2026-10-06
"""
from alembic import op
import sqlalchemy as sa


revision = "20261006_wishlist"
down_revision = "f1dc80592cbc"
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "wishlist_item",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("product_id", sa.Integer(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(["product_id"], ["product.id"]),
        sa.ForeignKeyConstraint(["user_id"], ["user.id"]),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("user_id", "product_id", name="uq_wishlist_user_product"),
    )


def downgrade():
    op.drop_table("wishlist_item")
