from flask import Blueprint, session, jsonify, request
from app.models import Order, Product, Address
from app import db

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
@order_bp.route("/", methods={"POST"})
def create_order():
    data = request.get_json()
    product_id = data.get("product_id")
    quantity = data.get("quantity")
    
    user_id = session.get("user_id")
    user_address = Address.query.filter_by(user_id)
    
    product = Product.query.get(product_id)
    
    if not product:
        return jsonify({"success": False, "message": "Product not found"}), 404
    
    if quantity <= 0:
        return jsonify({"success": False, "message": "Quantity must be greater than 0."}), 400
    
    total_price = product.price * quantity
    
    new_order = Order(
        user_id = user_id,
        product_id = product_id,
        quantity = quantity,
        total_price = total_price,
        address = user_address.full_address
    )
    
    db.session.add(new_order)
    db.session.commit() 
    
    return jsonify({"success": True, "message": "Order created successfully"}), 201   

# Update an order