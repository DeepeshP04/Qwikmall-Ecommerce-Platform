from app import db
from app.models import InventoryMovement, Product


class InventoryService:
    @staticmethod
    def reserve_for_order(items, actor_id, reference):
        quantities = {}
        for product_id, quantity in items:
            if isinstance(product_id, bool) or not isinstance(product_id, int) or product_id < 1:
                return None, "An order item has an invalid product ID."
            if isinstance(quantity, bool) or not isinstance(quantity, int) or quantity < 1:
                return None, "Order item quantities must be positive whole numbers."
            quantities[product_id] = quantities.get(product_id, 0) + quantity

        products = (
            Product.query.filter(Product.id.in_(quantities))
            .order_by(Product.id.asc())
            .with_for_update()
            .all()
        )
        products_by_id = {product.id: product for product in products}
        missing_ids = set(quantities) - set(products_by_id)
        if missing_ids:
            return None, f"Product {min(missing_ids)} was not found."

        for product_id, quantity in quantities.items():
            product = products_by_id[product_id]
            if not product.is_active:
                return None, f"{product.name} is no longer available."
            if product.stock < quantity:
                return None, f"Only {product.stock} unit(s) of {product.name} are available."

        for product_id, quantity in quantities.items():
            product = products_by_id[product_id]
            product.stock -= quantity
            db.session.add(InventoryMovement(
                product_id=product_id,
                quantity_change=-quantity,
                reason="order_placed",
                reference=reference,
                changed_by_id=actor_id,
            ))

        return products_by_id, None

    @staticmethod
    def restore_order_items(order, actor_id):
        products = (
            Product.query.filter(
                Product.id.in_([item.product_id for item in order.order_items])
            )
            .order_by(Product.id.asc())
            .with_for_update()
            .all()
        )
        products_by_id = {product.id: product for product in products}
        for item in order.order_items:
            product = products_by_id.get(item.product_id)
            if product:
                product.stock += item.quantity
                db.session.add(InventoryMovement(
                    product_id=product.id,
                    quantity_change=item.quantity,
                    reason="order_cancelled",
                    reference=order.order_number or str(order.id),
                    changed_by_id=actor_id,
                ))
