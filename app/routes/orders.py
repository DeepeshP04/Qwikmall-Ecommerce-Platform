from flask import Blueprint, session, jsonify
from app.models import Order

order_bp = Blueprint("orders", __name__, url_prefix="/orders")

# Get all orders
@order_bp.route("/", methods=["GET"])
def get_orders():
    user_id = session.get("user_id")
    if not user_id:
        return {"error": "User not logged in"}, 401
    
    orders = Order.query.filter_by(user_id=user_id).all()
    if not orders:
        return {"error": "No orders found"}, 404
    
    return jsonify({"orders": [order.to_dict() for order in orders]})

# Get an order by ID
@order_bp.route("/<int:order_id>", methods=["GET"])
def get_order_by_id(order_id):
    user_id = session.get("user_id")
    
    order = Order.query.filter_by(id=order_id, user_id=user_id).first()
    if not order:
        return {"error": "Order not found"}, 404
    
    return jsonify(order.to_dict())

# Create a new order

# Update an order