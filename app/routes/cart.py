from flask import Blueprint, jsonify, request, session
from app import db
from app.models import Cart, User, Product, CartItem

cart_bp = Blueprint("cart", __name__, url_prefix="/cart")

# Get cart items
@cart_bp.route("/items", methods=["GET"])
def get_cart_items_by_id():
    user_id = session["user"]["user_id"]
    cart_items = Cart.query.filter_by(user_id=user_id).all()
    return jsonify({"cart": [item.to_dict() for item in cart_items]}), 200

# Add an item to the cart
@cart_bp.route("/items", methods=["POST"])
def add_cart_item():
    data = request.get_json()
    product_id = data.get("product_id")
    quantity = data.get("quantity", 1)
    
    user_id = session["user"]["user_id"]
    user = User.query.get(user_id)
    if not user:
        return jsonify({"success": False, "message": "User not found."}), 404
    
    product = Product.query.get(product_id)
    if not product:
        return jsonify({"success": False, "message": "Product not found."}), 404
    
    if quantity <= 0:
        return jsonify({"success": False, "message": "Quantity must be greater than 0."}), 400
    
    cart = Cart.query.filter_by(user_id=user_id).first()
    
    if not cart:
        cart = Cart(user_id=user_id)
        db.session.add(cart)
        db.session.commit()
        
    existing_cart_item = CartItem.query.filter_by(cart_id=cart.id, product_id=product_id).first()
    
    if existing_cart_item:
        existing_cart_item.quantity += quantity
        existing_cart_item.total_price += product.price * quantity
        
        db.session.commit()
        return jsonify({"success": True, "message": "Item updated in cart."}), 200
    else:
        total_price = product.price * quantity
        price = product.price 
        
        new_cart_item = CartItem(
            cart_id=cart.id,
            product_id=product_id,
            quantity=quantity,
            price=price,
            total_price=total_price
        )
    
        db.session.add(new_cart_item)
        db.session.commit()
        
        return jsonify({"success": True, "message": "Item added to cart."}), 201
    
# Update cart items
@cart_bp.route("/items/<int:product_id>", methods=["PUT"])
def update_cart_item(product_id):
    data = request.get_json()
    quantity = data.get("quantity")
    
    user = User.query.get(session["user"]["user_id"])
    if not user:
        return jsonify({"success": False, "message": "User not found."}), 404
    
    product = Product.query.get(product_id)
    if not product:
        return jsonify({"success": False, "message": "Product not found."}), 404
    
    cart = Cart.query.filter_by(user_id=user.id).first()
    
    cart_item = CartItem.query.filter_by(cart_id=cart.id, product_id=product_id).first()
    cart_item.quantity = quantity
    cart_item.total_price = product.price * quantity
    db.session.commit()
    
    return jsonify({"success": True, "message": "Item updated in cart."}), 200
    
# Delete cart item
@cart_bp.route("/items/<int:product_id>", methods=["DELETE"])
def delete_cart_item(product_id):
    user_id = session["user"]["user_id"] 
    
    cart = Cart.query.filter_by(user_id=user_id) 
    
    cart_item = CartItem.query.filter_by(cart_id=cart.id, product_id=product_id).first()
    
    if not cart_item:
        return jsonify({"success": False, "message": "Item not found in cart."}), 404
    
    db.session.delete(cart_item)
    db.session.commit()
    
    return jsonify({"success": True, "message": "Item removed from cart."}), 200