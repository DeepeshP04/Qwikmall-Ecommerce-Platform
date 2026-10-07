"""Add ecommerce order snapshots and operational audit tables.

Revision ID: 20261007_ecommerce_ops
Revises: 20261007_product_stock
Create Date: 2026-10-07
"""
from alembic import op
import sqlalchemy as sa


revision = "20261007_ecommerce_ops"
down_revision = "20261007_product_stock"
branch_labels = None
depends_on = None


def _has_table(table_name):
    return sa.inspect(op.get_bind()).has_table(table_name)


def _has_column(table_name, column_name):
    return any(
        column["name"] == column_name
        for column in sa.inspect(op.get_bind()).get_columns(table_name)
    )


def _has_unique(table_name, constraint_name):
    inspector = sa.inspect(op.get_bind())
    return (
        constraint_name in {
            constraint["name"]
            for constraint in inspector.get_unique_constraints(table_name)
        }
        or constraint_name in {
            index["name"]
            for index in inspector.get_indexes(table_name)
        }
    )


def _add_column_if_missing(table_name, column):
    if not _has_column(table_name, column.name):
        op.add_column(table_name, column)


def _add_unique_if_missing(table_name, constraint_name, columns):
    if not _has_unique(table_name, constraint_name):
        op.create_unique_constraint(constraint_name, table_name, columns)


def _backfill_order_history():
    order_table = sa.table(
        "order",
        sa.column("id", sa.Integer()),
        sa.column("status", sa.String(length=20)),
        sa.column("created_at", sa.DateTime()),
    )
    history_table = sa.table(
        "order_status_history",
        sa.column("order_id", sa.Integer()),
        sa.column("previous_status", sa.String(length=20)),
        sa.column("status", sa.String(length=20)),
        sa.column("changed_by_id", sa.Integer()),
        sa.column("note", sa.String(length=500)),
        sa.column("created_at", sa.DateTime()),
    )
    op.get_bind().execute(
        history_table.insert().from_select(
            [
                "order_id",
                "previous_status",
                "status",
                "changed_by_id",
                "note",
                "created_at",
            ],
            sa.select(
                order_table.c.id,
                sa.null(),
                sa.func.coalesce(order_table.c.status, "Pending"),
                sa.null(),
                sa.literal("Order status at migration time"),
                order_table.c.created_at,
            )
            .where(
                ~sa.exists(
                    sa.select(1).where(history_table.c.order_id == order_table.c.id)
                )
            ),
        )
    )


def upgrade():
    _add_column_if_missing("product", sa.Column("sku", sa.String(length=64), nullable=True))
    _add_column_if_missing(
        "product",
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default="1"),
    )
    _add_unique_if_missing("product", "uq_product_sku", ["sku"])

    _add_column_if_missing(
        "address",
        sa.Column("recipient_name", sa.String(length=100), nullable=True),
    )
    _add_column_if_missing(
        "address",
        sa.Column("recipient_phone", sa.String(length=20), nullable=True),
    )

    for column in (
        sa.Column("order_number", sa.String(length=32), nullable=True),
        sa.Column("subtotal", sa.DECIMAL(10, 2), nullable=False, server_default="0"),
        sa.Column("tax_amount", sa.DECIMAL(10, 2), nullable=False, server_default="0"),
        sa.Column("shipping_amount", sa.DECIMAL(10, 2), nullable=False, server_default="0"),
        sa.Column("discount_amount", sa.DECIMAL(10, 2), nullable=False, server_default="0"),
        sa.Column("currency", sa.String(length=3), nullable=False, server_default="INR"),
        sa.Column("shipping_recipient", sa.String(length=100), nullable=True),
        sa.Column("shipping_phone", sa.String(length=20), nullable=True),
        sa.Column("shipping_address_line1", sa.String(length=100), nullable=True),
        sa.Column("shipping_address_line2", sa.String(length=100), nullable=True),
        sa.Column("shipping_city", sa.String(length=50), nullable=True),
        sa.Column("shipping_state", sa.String(length=50), nullable=True),
        sa.Column("shipping_postal_code", sa.String(length=10), nullable=True),
        sa.Column("shipping_country", sa.String(length=50), nullable=True),
        sa.Column("shipping_landmark", sa.String(length=100), nullable=True),
    ):
        _add_column_if_missing("order", column)
    _add_unique_if_missing("order", "uq_order_number", ["order_number"])

    for column in (
        sa.Column("product_name", sa.String(length=100), nullable=True),
        sa.Column("product_sku", sa.String(length=64), nullable=True),
        sa.Column("line_total", sa.DECIMAL(10, 2), nullable=True),
    ):
        _add_column_if_missing("order_item", column)

    product_table = sa.table(
        "product",
        sa.column("id", sa.Integer()),
        sa.column("name", sa.String(length=50)),
        sa.column("sku", sa.String(length=64)),
    )
    order_item_table = sa.table(
        "order_item",
        sa.column("product_id", sa.Integer()),
        sa.column("quantity", sa.Integer()),
        sa.column("price", sa.DECIMAL(10, 2)),
        sa.column("product_name", sa.String(length=100)),
        sa.column("product_sku", sa.String(length=64)),
        sa.column("line_total", sa.DECIMAL(10, 2)),
    )
    op.get_bind().execute(
        order_item_table.update().values(
            product_name=sa.func.coalesce(
                order_item_table.c.product_name,
                sa.select(product_table.c.name).where(
                    product_table.c.id == order_item_table.c.product_id
                ).scalar_subquery(),
            ),
            product_sku=sa.func.coalesce(
                order_item_table.c.product_sku,
                sa.select(product_table.c.sku).where(
                    product_table.c.id == order_item_table.c.product_id
                ).scalar_subquery(),
            ),
            line_total=sa.func.coalesce(
                order_item_table.c.line_total,
                sa.func.coalesce(order_item_table.c.price, 0) * order_item_table.c.quantity,
            ),
        ).where(order_item_table.c.line_total.is_(None))
    )

    for column in (
        sa.Column("currency", sa.String(length=3), nullable=False, server_default="INR"),
        sa.Column("gateway_order_id", sa.String(length=100), nullable=True),
        sa.Column("gateway_payment_id", sa.String(length=100), nullable=True),
        sa.Column("failure_reason", sa.String(length=500), nullable=True),
        sa.Column("paid_at", sa.DateTime(), nullable=True),
    ):
        _add_column_if_missing("payment", column)
    _add_unique_if_missing("payment", "uq_payment_gateway_order_id", ["gateway_order_id"])
    _add_unique_if_missing("payment", "uq_payment_gateway_payment_id", ["gateway_payment_id"])

    if not _has_table("inventory_movement"):
        op.create_table(
            "inventory_movement",
            sa.Column("id", sa.Integer(), nullable=False),
            sa.Column("product_id", sa.Integer(), nullable=False),
            sa.Column("quantity_change", sa.Integer(), nullable=False),
            sa.Column("reason", sa.String(length=50), nullable=False),
            sa.Column("reference", sa.String(length=100), nullable=True),
            sa.Column("changed_by_id", sa.Integer(), nullable=True),
            sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
            sa.ForeignKeyConstraint(["changed_by_id"], ["user.id"]),
            sa.ForeignKeyConstraint(["product_id"], ["product.id"]),
            sa.PrimaryKeyConstraint("id"),
        )
    if "ix_inventory_movement_product_created" not in {
        index["name"] for index in sa.inspect(op.get_bind()).get_indexes("inventory_movement")
    }:
        op.create_index(
            "ix_inventory_movement_product_created",
            "inventory_movement",
            ["product_id", "created_at"],
        )

    if not _has_table("order_status_history"):
        op.create_table(
            "order_status_history",
            sa.Column("id", sa.Integer(), nullable=False),
            sa.Column("order_id", sa.Integer(), nullable=False),
            sa.Column("previous_status", sa.String(length=20), nullable=True),
            sa.Column("status", sa.String(length=20), nullable=False),
            sa.Column("changed_by_id", sa.Integer(), nullable=True),
            sa.Column("note", sa.String(length=500), nullable=True),
            sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
            sa.ForeignKeyConstraint(["changed_by_id"], ["user.id"]),
            sa.ForeignKeyConstraint(["order_id"], ["order.id"]),
            sa.PrimaryKeyConstraint("id"),
        )
    if "ix_order_status_history_order_created" not in {
        index["name"] for index in sa.inspect(op.get_bind()).get_indexes("order_status_history")
    }:
        op.create_index(
            "ix_order_status_history_order_created",
            "order_status_history",
            ["order_id", "created_at"],
        )
    op.get_bind().execute(
        sa.text(
            "UPDATE `order` "
            "SET order_number = COALESCE(order_number, CONCAT('ORD-', LPAD(id, 10, '0'))), "
            "subtotal = total_price"
        )
    )
    _backfill_order_history()


def downgrade():
    op.drop_index("ix_order_status_history_order_created", table_name="order_status_history")
    op.drop_table("order_status_history")
    op.drop_index("ix_inventory_movement_product_created", table_name="inventory_movement")
    op.drop_table("inventory_movement")

    with op.batch_alter_table("payment") as batch_op:
        batch_op.drop_constraint("uq_payment_gateway_payment_id", type_="unique")
        batch_op.drop_constraint("uq_payment_gateway_order_id", type_="unique")
        batch_op.drop_column("paid_at")
        batch_op.drop_column("failure_reason")
        batch_op.drop_column("gateway_payment_id")
        batch_op.drop_column("gateway_order_id")
        batch_op.drop_column("currency")

    with op.batch_alter_table("order_item") as batch_op:
        batch_op.drop_column("line_total")
        batch_op.drop_column("product_sku")
        batch_op.drop_column("product_name")

    with op.batch_alter_table("order") as batch_op:
        batch_op.drop_constraint("uq_order_number", type_="unique")
        batch_op.drop_column("shipping_landmark")
        batch_op.drop_column("shipping_country")
        batch_op.drop_column("shipping_postal_code")
        batch_op.drop_column("shipping_state")
        batch_op.drop_column("shipping_city")
        batch_op.drop_column("shipping_address_line2")
        batch_op.drop_column("shipping_address_line1")
        batch_op.drop_column("shipping_phone")
        batch_op.drop_column("shipping_recipient")
        batch_op.drop_column("currency")
        batch_op.drop_column("discount_amount")
        batch_op.drop_column("shipping_amount")
        batch_op.drop_column("tax_amount")
        batch_op.drop_column("subtotal")
        batch_op.drop_column("order_number")

    with op.batch_alter_table("address") as batch_op:
        batch_op.drop_column("recipient_phone")
        batch_op.drop_column("recipient_name")

    with op.batch_alter_table("product") as batch_op:
        batch_op.drop_constraint("uq_product_sku", type_="unique")
        batch_op.drop_column("is_active")
        batch_op.drop_column("sku")
