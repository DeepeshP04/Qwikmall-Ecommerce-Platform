from flask import Blueprint, session, request
from app.models import Order, Product, Address, OrderItem
from app import db
from app.services.order_service import OrderService
from app.utils.helpers import login_required

order_bp = Blueprint("orders", __name__, url_prefix="/orders")

# Create a new order
@order_bp.route("/", methods=["POST"], strict_slashes=False)
@login_required
def create_order():
    user_id = session.get("user").get("user_id")
    data = request.get_json()
    items = data.get("items", [])
    return OrderService.create_order(user_id, items)

# List all orders for the current user
@order_bp.route("/", methods=["GET"], strict_slashes=False)
@login_required
def list_user_orders():
    user_id = session.get("user").get("user_id")
    return OrderService.list_user_orders(user_id)

# Get details for a specific order
@order_bp.route("/<int:order_id>", methods=["GET"], strict_slashes=False)
@login_required
def get_order_details(order_id):
    user_id = session.get("user").get("user_id")
    return OrderService.get_order_details(user_id, order_id)