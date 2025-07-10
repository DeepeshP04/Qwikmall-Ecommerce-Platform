import razorpay
from app.models import Product, Cart, CartItem, Order, OrderItem, Address, db
from flask import jsonify, current_app

class CheckoutService:
    @staticmethod
    def unauthorized_response():
        return jsonify({"success": False, "message": "User not logged in"}), 401
    @staticmethod
    def checkout(user_id, data):
        address_id = data.get("address_id")
        payment_method = data.get("payment_method", "razorpay")
        address = Address.query.filter_by(id=address_id, user_id=user_id).first()
        if not address:
            return jsonify({"success": False, "message": "Invalid address."}), 400

        # Buy Now flow
        if data.get("product_id"):
            product = Product.query.get(data["product_id"])
            if not product:
                return jsonify({"success": False, "message": "Product not found."}), 404
            quantity = data.get("quantity", 1)
            total_price = float(product.price) * quantity
            order_items = [OrderItem(product_id=product.id, quantity=quantity, price=product.price, total_price=total_price)]
        else:
            # Cart flow
            cart = Cart.query.filter_by(user_id=user_id).first()
            if not cart or not cart.cart_items:
                return jsonify({"success": False, "message": "Cart is empty."}), 400
            order_items = []
            total_price = 0
            for item in cart.cart_items:
                item_total = float(item.product.price) * item.quantity
                total_price += item_total
                order_items.append(OrderItem(product_id=item.product_id, quantity=item.quantity, price=item.product.price, total_price=item_total))

        # Create order in DB (Pending)
        new_order = Order(user_id=user_id, address_id=address.id, total_price=total_price, status="Pending")
        db.session.add(new_order)
        db.session.commit()
        for item in order_items:
            item.order_id = new_order.id
            db.session.add(item)
        db.session.commit()

        # Initiate Razorpay payment
        client = razorpay.Client(auth=(current_app.config.get("RAZORPAY_KEY_ID"), current_app.config.get("RAZORPAY_KEY_SECRET")))
        razorpay_order = client.order.create({
            "amount": int(total_price * 100),
            "currency": "INR",
            "payment_capture": 1,
            "notes": {"order_id": new_order.id}
        })
        # Save razorpay_order['id'] in your order if needed
        return jsonify({
            "order_id": new_order.id,
            "payment_provider": "razorpay",
            "payment_order_id": razorpay_order["id"],
            "amount": int(total_price * 100),
            "currency": "INR"
        }), 200 