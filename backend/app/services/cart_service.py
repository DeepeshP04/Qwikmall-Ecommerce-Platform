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
                "product_id": item.product_id,
                "product_name": item.product.name,
                "quantity": item.quantity,
                "price": float(item.product.price),
                "total": float(item.product.price) * item.quantity
            }
            for item in cart.cart_items
        ]
        return jsonify({"success": True, "items": items}), 200

    @staticmethod
    def add_or_update_cart_item(user_id, product_id, quantity):
        product = Product.query.get(product_id)
        if not product:
            return jsonify({"success": False, "message": "Product not found."}), 404
        cart = Cart.query.filter_by(user_id=user_id).first()
        if not cart:
            cart = Cart(user_id=user_id)
            db.session.add(cart)
            db.session.commit()
        cart_item = CartItem.query.filter_by(cart_id=cart.id, product_id=product_id).first()
        if cart_item:
            cart_item.quantity += quantity
        else:
            cart_item = CartItem(cart_id=cart.id, product_id=product_id, quantity=quantity)
            db.session.add(cart_item)
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
        db.session.commit()
        return jsonify({"success": True, "message": "Cart item deleted."}), 200 