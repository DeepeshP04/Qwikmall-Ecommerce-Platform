from flask import Blueprint, session, jsonify, request
from app.models import Order, Product, Address, OrderItem
from app import db

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
    
    order = Order.query.filter_by(user_id=user_id, order_id=order_id).first()
    
    if not order:
        return {"error": "Order not found"}, 404
    
    return jsonify(order.to_dict())

# Create a new order
@order_bp.route("/", methods={"POST"})
def create_order():
    data = request.get_json()
    items = data.get("items", [])
    user_id = session.get("user")["user_id"]
    address_id = Address.query.filter_by(user_id)
    
    order_items = []
    total_price = 0
    
    if not items:
        return jsonify({"error": "No items provided."}), 400
    
    # add all items in orderItem table
    for item in items:
        product = Product.query.filter_by(item["product_id"])
        if not product:
            return jsonify({"error": f"Product {item['product_id']} not found"}), 404
        
        quantity = item["quantity"]
        item_total = product.price * quantity
        total_price += item_total
        
        order_items.append(OrderItem(
            product_id=product.id,
            quantity=quantity,
            price=product.price,
            total_price=item_total
        ))
    
    # create new order
    new_order = Order(
        user_id=user_id,
        address_id=address_id,
        total_price = total_price
    )
    
    db.session.add(new_order)
    db.session.commit() 
    
    # add order_id in all order_items
    for item in order_items:
        item.order_id = new_order.id
        db.session.add(item)
        
    db.session.commit()
    
    return jsonify({"success": True, "message": "Order created successfully", "order": new_order.to_dict()}), 201   

# Update an order