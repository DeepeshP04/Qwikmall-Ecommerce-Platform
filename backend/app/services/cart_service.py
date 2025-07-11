from flask import jsonify
from app.models import Cart, CartItem, Product, ProductAttribute, ProductAttributeValue, ProductImage
from app import db

class CartService:
    @staticmethod
    def get_user_cart(user_id):
        cart = Cart.query.filter_by(user_id=user_id).first()
        if not cart or not cart.cart_items:
            return jsonify({"success": False, "message": "Cart is empty."}), 404
        items = [
            {
                "item_id": item.id,
                "quantity": item.quantity,
                "product": {
                    "id": item.product.id,
                    "name": item.product.name,
                    "price": float(item.product.price),
                    "img_url": item.product.images[0].url if item.product.images else None
                }
            }
            for item in cart.cart_items
        ]
        cart_data = {
            "cart_id": cart.id,
            "total_price": cart.total_price,
            "items": items
        }
        return jsonify({"success": True, "data": cart_data}), 200

    @staticmethod
    def add_or_update_cart_item(user_id, product_id, quantity):
        product = Product.query.get(product_id)
        if not product:
            return jsonify({"success": False, "message": "Product not found."}), 404
        cart = Cart.query.filter_by(user_id=user_id).first()
        if not cart:
            cart = Cart(user_id=user_id, total_price=0)
            db.session.add(cart)
        cart_item = CartItem.query.filter_by(cart_id=cart.id, product_id=product_id).first()
        if cart_item:
            cart_item.quantity += quantity
        else:
            cart_item = CartItem(cart_id=cart.id, product_id=product_id, quantity=quantity)
            db.session.add(cart_item)
        total = 0
        for item in cart.cart_items:
            total += item.product.price * item.quantity
        cart.total_price = total
        db.session.commit()
        return jsonify({"success": True, "message": "Item added/updated in cart."}), 200

    @staticmethod
    def update_cart_item_quantity(user_id, item_id, quantity):
        cart = Cart.query.filter_by(user_id=user_id).first()
        if not cart:
            return jsonify({"success": False, "message": "Cart not found."}), 404
        cart_item = CartItem.query.filter_by(id=item_id, cart_id=cart.id).first()
        if not cart_item:
            return jsonify({"success": False, "message": "Cart item not found."}), 404
        cart_item.quantity = quantity
        total = 0
        for item in cart.cart_items:
            total += item.product.price * item.quantity
        cart.total_price = total
        db.session.commit()
        return jsonify({"success": True, "message": "Cart item quantity updated."}), 200

    @staticmethod
    def delete_cart_item(user_id, item_id):
        cart = Cart.query.filter_by(user_id=user_id).first()
        if not cart:
            return jsonify({"success": False, "message": "Cart not found."}), 404
        cart_item = CartItem.query.filter_by(id=item_id, cart_id=cart.id).first()
        if not cart_item:
            return jsonify({"success": False, "message": "Cart item not found."}), 404
        db.session.delete(cart_item)
        total = 0
        for item in cart.cart_items:
            total += item.product.price * item.quantity
        cart.total_price = total
        db.session.commit()
        return jsonify({"success": True, "message": "Cart item deleted."}), 200 