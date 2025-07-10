from flask import Blueprint, session, request
from app.models import Order, Product, Address, OrderItem
from app import db
from app.services.order_service import OrderService
from app.services.checkout_service import CheckoutService

order_bp = Blueprint("orders", __name__, url_prefix="/orders")

# Create a new order
@order_bp.route("/", methods=["POST"])
def create_order():
    user = session.get("user")
    if not user:
        return OrderService.unauthorized_response()
    user_id = user["user_id"]
    data = request.get_json()
    items = data.get("items", [])
    return OrderService.create_order(user_id, items)

# List all orders for the current user
@order_bp.route("/", methods=["GET"])
def list_user_orders():
    user = session.get("user")
    if not user:
        return OrderService.unauthorized_response()
    user_id = user["user_id"]
    return OrderService.list_user_orders(user_id)

# Get details for a specific order
@order_bp.route("/<int:order_id>", methods=["GET"])
def get_order_details(order_id):
    user = session.get("user")
    if not user:
        return OrderService.unauthorized_response()
    user_id = user["user_id"]
    return OrderService.get_order_details(user_id, order_id)

@order_bp.route('/checkout', methods=['POST'])
def checkout():
    user = session.get('user')
    if not user:
        return CheckoutService.unauthorized_response()
    user_id = user['user_id']
    data = request.get_json()
    return CheckoutService.checkout(user_id, data)