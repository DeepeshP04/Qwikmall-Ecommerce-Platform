from flask import Blueprint, session, jsonify, request
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
        return jsonify({"success": False, "message": "User not logged in"}), 401
    user_id = user["user_id"]
    data = request.get_json()
    items = data.get("items", [])
    response, status = OrderService.create_order(user_id, items)
    return jsonify(response), status

# List all orders for the current user
@order_bp.route("/", methods=["GET"])
def list_user_orders():
    user = session.get("user")
    if not user:
        return jsonify({"success": False, "message": "User not logged in"}), 401
    user_id = user["user_id"]
    response, status = OrderService.list_user_orders(user_id)
    return jsonify(response), status

# Get details for a specific order
@order_bp.route("/<int:order_id>", methods=["GET"])
def get_order_details(order_id):
    user = session.get("user")
    if not user:
        return jsonify({"success": False, "message": "User not logged in"}), 401
    user_id = user["user_id"]
    response, status = OrderService.get_order_details(user_id, order_id)
    return jsonify(response), status

@order_bp.route('/checkout', methods=['POST'])
def checkout():
    user = session.get('user')
    if not user:
        return jsonify({'success': False, 'message': 'User not logged in'}), 401
    user_id = user['user_id']
    data = request.get_json()
    response, status = CheckoutService.checkout(user_id, data)
    return jsonify(response), status