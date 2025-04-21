from flask import Blueprint, jsonify
from app.models import Cart

cart_bp = Blueprint("cart", __name__, url_prefix="/cart")

# Get cart items
@cart_bp.route("/<int:user_id/items", methods=["GET"])
def get_cart_items_by_id(user_id):
    cart_items = Cart.query.filter_by(user_id=user_id).all()
    return jsonify({"cart": [item.to_dict() for item in cart_items]}), 200

# Add an item to the cart

# Update cart items

# Delete cart item