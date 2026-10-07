from decimal import Decimal
import uuid

import razorpay
from flask import current_app, jsonify
from requests.exceptions import RequestException

from app import db
from app.models import (
    Address,
    Cart,
    Order,
    OrderItem,
    OrderStatusHistory,
    Payment,
)
from app.services.cart_service import CartService
from app.services.inventory_service import InventoryService


class CheckoutService:
    @staticmethod
    def checkout(user_id, data):
        if not isinstance(data, dict):
            return jsonify({"success": False, "message": "A checkout object is required."}), 400

        payment_method = data.get("payment_method", "razorpay")
        if payment_method != "razorpay":
            return jsonify({"success": False, "message": "Unsupported payment method."}), 400

        key_id = current_app.config.get("RAZORPAY_KEY_ID")
        key_secret = current_app.config.get("RAZORPAY_KEY_SECRET")
        if not key_id or not key_secret:
            return jsonify({"success": False, "message": "Online payment is not configured."}), 503

        address_id = data.get("address_id")
        address = Address.query.filter_by(id=address_id, user_id=user_id).first()
        if not address:
            return jsonify({"success": False, "message": "Invalid address."}), 400

        buy_now_product_id = data.get("product_id")
        if buy_now_product_id is not None:
            quantity = data.get("quantity", 1)
            if isinstance(buy_now_product_id, bool) or not isinstance(buy_now_product_id, int):
                return jsonify({"success": False, "message": "A valid product_id is required."}), 400
            if isinstance(quantity, bool) or not isinstance(quantity, int) or quantity < 1:
                return jsonify({"success": False, "message": "Quantity must be a positive whole number."}), 400
            requested_items = [(buy_now_product_id, quantity)]
            cart = None
        else:
            cart = Cart.query.filter_by(user_id=user_id).first()
            if not cart or not cart.cart_items:
                return jsonify({"success": False, "message": "Cart is empty."}), 400
            requested_items = [(item.product_id, item.quantity) for item in cart.cart_items]

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
            return jsonify({"success": False, "message": inventory_error}), status_code

        total_price = Decimal("0.00")
        for product_id, quantity in requested_items:
            product = products_by_id[product_id]
            line_total = Decimal(product.price) * quantity
            total_price += line_total
            order.order_items.append(OrderItem(
                product_id=product.id,
                quantity=quantity,
                price=product.price,
                product_name=product.name,
                product_sku=product.sku,
                line_total=line_total,
            ))

        order.subtotal = total_price
        order.total_price = total_price
        order.snapshot_shipping_address(address)
        order.status_history.append(OrderStatusHistory(
            previous_status=None,
            status="Pending",
            changed_by_id=user_id,
        ))
        db.session.add(order)
        db.session.flush()

        try:
            client = razorpay.Client(auth=(key_id, key_secret))
            razorpay_order = client.order.create({
                "amount": int(total_price * 100),
                "currency": order.currency,
                "payment_capture": 1,
                "notes": {
                    "order_id": order.id,
                    "order_number": order.order_number,
                },
            })
        except (razorpay.errors.BadRequestError, razorpay.errors.GatewayError,
                razorpay.errors.ServerError, RequestException):
            db.session.rollback()
            return jsonify({
                "success": False,
                "message": "The payment provider could not create a payment. No order or stock change was saved.",
            }), 502

        db.session.add(Payment(
            user_id=user_id,
            order_id=order.id,
            amount=total_price,
            currency=order.currency,
            status="Pending",
            method=payment_method,
            payment_gateway="Razorpay",
            gateway_order_id=razorpay_order["id"],
        ))
        CartService.consume_ordered_items(cart, requested_items)
        db.session.commit()

        return jsonify({
            "success": True,
            "order_id": order.id,
            "order_number": order.order_number,
            "payment_provider": "razorpay",
            "payment_order_id": razorpay_order["id"],
            "amount": int(total_price * 100),
            "currency": order.currency,
        }), 201
