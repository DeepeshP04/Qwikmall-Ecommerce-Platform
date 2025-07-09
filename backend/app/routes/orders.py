from flask import Blueprint, session, jsonify, request
from app.models import Order, Product, Address, OrderItem
from app import db
from app.services.order_service import OrderService

order_bp = Blueprint("orders", __name__, url_prefix="/orders")

# Get all orders
@order_bp.route("/", methods=["GET"])
def get_orders():
    user = session.get("user")
    if not user:
        return {"error": "User not logged in"}, 401
    else:
        user_id = user.get("user_id")
    
    orders = Order.query.filter_by(user_id=user_id).all()
    
    if not orders:
        return {"error": "No orders found"}, 404
    
    return jsonify({"orders": [order.to_dict() for order in orders]})

# Get an order by ID
@order_bp.route("/<int:order_id>", methods=["GET"])
def get_order_by_id(order_id):
    user = session.get("user")
    if not user:
        return {"error": "User not logged in"}, 401
    else:
        user_id = user.get("user_id")
    
    order = Order.query.filter_by(user_id=user_id, id=order_id).first()
    
    if not order:
        return {"error": "Order not found"}, 404
    
    return jsonify(order.to_dict())

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

# Update an order