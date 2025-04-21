from flask import Blueprint, jsonify
from app.models import Cart
from app import db

cart_bp = Blueprint("cart", __name__, url_prefix="/cart")

# Get cart items
@cart_bp.route("/<int:user_id/items", methods=["GET"])
def get_cart_items_by_id(user_id):
    cart_items = Cart.query.filter_by(user_id=user_id).all()
    return jsonify({"cart": [item.to_dict() for item in cart_items]}), 200

# Add an item to the cart

# Update cart items

# Delete cart item
@cart_bp.route("/<int:user_id>/items/<int:product_id>", methods=["DELETE"])
def delete_cart_item(user_id, product_id):
    cart_item = Cart.query.filter_by(user_id=user_id, product_id=product_id).first()
    
    if not cart_item:
        return jsonify({"success": False, "message": "Item not found in cart."}), 404
    
    db.session.delete(cart_item)
    db.session.commit()
    
    return jsonify({"success": True, "message": "Item removed from cart."}), 200