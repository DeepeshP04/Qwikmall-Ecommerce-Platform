from flask import Blueprint, request, session
from app import db
from app.models import Cart, User, Product, CartItem
from app.services.cart_service import CartService
from app.utils.helpers import login_required

cart_bp = Blueprint("cart", __name__, url_prefix="/cart")

# Get current user's cart
@cart_bp.route("", methods=["GET"])
@login_required
def get_my_cart():
    user_id = session["user"]["user_id"]
    return CartService.get_user_cart(user_id)

# Add an item to the cart
@cart_bp.route("/items", methods=["POST"])
@login_required
def add_cart_item():
    data = request.get_json()
    product_id = data.get("product_id")
    quantity = data.get("quantity", 1)
    user_id = session["user"]["user_id"]
    return CartService.add_or_update_cart_item(user_id, product_id, quantity)

# Update cart items
@cart_bp.route("/items/<int:item_id>", methods=["PATCH"])
@login_required
def update_cart_item(item_id):
    data = request.get_json()
    quantity = data.get("quantity")
    user_id = session["user"]["user_id"]
    return CartService.update_cart_item_quantity(user_id, item_id, quantity)

# Delete cart item
@cart_bp.route("/items/<int:item_id>", methods=["DELETE"])
@login_required
def delete_cart_item(item_id):
    user_id = session["user"]["user_id"]
    return CartService.delete_cart_item(user_id, item_id)