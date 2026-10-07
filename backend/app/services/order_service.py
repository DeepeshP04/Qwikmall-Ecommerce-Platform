from decimal import Decimal
import uuid

from app.models import Address, Cart, Order, OrderItem, OrderStatusHistory, Payment
from app import db
from app.services.cart_service import CartService
from app.services.inventory_service import InventoryService

class OrderService:
    @staticmethod
    def create_order(user_id, data):
        if not isinstance(data, dict):
            return {"success": False, "message": "An order object is required."}, 400
        items = data.get("items")
        if not isinstance(items, list) or not items:
            return {"success": False, "message": "No items provided."}, 400

        address_id = data.get("address_id")
        payment_method = data.get("payment_method", "cod")
        if not isinstance(payment_method, str) or payment_method not in {"cod", "upi", "card"}:
            return {"success": False, "message": "Unsupported payment method."}, 400

        address_query = Address.query.filter_by(user_id=user_id)
        if address_id:
            address_query = address_query.filter_by(id=address_id)
        else:
            address_query = address_query.order_by(Address.is_default.desc(), Address.id.asc())
        address = address_query.first()
        if not address:
            return {"success": False, "message": "No address found for user."}, 404

        requested_items = []
        for item in items:
            if not isinstance(item, dict):
                return {"success": False, "message": "Each order item must be an object."}, 400
            product_id = item.get("product_id")
            quantity = item.get("quantity")
            if isinstance(product_id, bool) or not isinstance(product_id, int) or product_id < 1:
                return {"success": False, "message": "Each order item needs a valid product_id."}, 400
            if isinstance(quantity, bool) or not isinstance(quantity, int) or quantity < 1:
                return {"success": False, "message": "Item quantities must be positive whole numbers."}, 400
            requested_items.append((product_id, quantity))

        order = Order(
            order_number=uuid.uuid4().hex.upper(),
            user_id=user_id,
            address_id=address.id,
            subtotal=Decimal("0.00"),
            total_price=Decimal("0.00"),
            payment_method=payment_method,
            status="Pending",
        )
        products_by_id, inventory_error = InventoryService.reserve_for_order(
            requested_items,
            actor_id=user_id,
            reference=order.order_number,
        )
        if inventory_error:
            db.session.rollback()
            status_code = 404 if "was not found" in inventory_error else 409
            return {"success": False, "message": inventory_error}, status_code

        total_price = Decimal("0.00")
        order_items = []
        for product_id, quantity in requested_items:
            product = products_by_id[product_id]
            item_total = Decimal(product.price) * quantity
            total_price += item_total
            order_items.append(OrderItem(
                product_id=product.id,
                quantity=quantity,
                price=product.price,
                product_name=product.name,
                product_sku=product.sku,
                line_total=item_total,
            ))

        order.subtotal = total_price
        order.total_price = total_price
        order.snapshot_shipping_address(address)
        order.order_items.extend(order_items)
        order.status_history.append(OrderStatusHistory(
            previous_status=None,
            status="Pending",
            changed_by_id=user_id,
        ))
        db.session.add(Payment(
            user_id=user_id,
            order=order,
            amount=total_price,
            currency=order.currency,
            status="Pending",
            method=payment_method,
        ))
        cart = Cart.query.filter_by(user_id=user_id).first()
        CartService.consume_ordered_items(cart, requested_items)
        db.session.add(order)
        db.session.commit()
        return {"success": True, "message": "Order created successfully", "order": order.to_dict()}, 201

    @staticmethod
    def list_user_orders(user_id):
        orders = Order.query.filter_by(user_id=user_id).all()
        if not orders:
            return {"success": False, "message": "No orders found."}, 404
        return {"success": True, "data": [order.to_dict() for order in orders]}, 200

    @staticmethod
    def get_order_details(user_id, order_id):
        order = Order.query.filter_by(user_id=user_id, id=order_id).first()
        if not order:
            return {"success": False, "message": "Order not found."}, 404
        return {"success": True, "data": order.to_dict()}, 200 