from decimal import Decimal

from flask import jsonify

from app import db
from app.models import Cart, CartItem, Product

class CartService:
    @staticmethod
    def get_user_cart(user_id):
        cart = Cart.query.filter_by(user_id=user_id).first()
        if not cart or not cart.cart_items:
            return jsonify({"success": True, "data": {"cart_id": cart.id if cart else None, "total_price": 0, "items": []}}), 200
        items = [
            {
                "item_id": item.id,
                "quantity": item.quantity,
                "product": {
                    "id": item.product.id,
                    "name": item.product.name,
                    "price": float(item.product.price),
                    "img_url": next(
                        (image.image_url for image in item.product.images if image.is_primary),
                        item.product.images[0].image_url if item.product.images else None,
                    )
                }
            }
            for item in cart.cart_items
        ]
        cart_data = {
            "cart_id": cart.id,
            "total_price": float(CartService._calculate_total(cart)),
            "items": items
        }
        return jsonify({"success": True, "data": cart_data}), 200

    @staticmethod
    def add_or_update_cart_item(user_id, product_id, quantity):
        if isinstance(product_id, bool) or not isinstance(product_id, int):
            return jsonify({"success": False, "message": "A valid product_id is required."}), 400
        if isinstance(quantity, bool) or not isinstance(quantity, int) or quantity < 1:
            return jsonify({"success": False, "message": "Quantity must be a positive whole number."}), 400
        product = Product.query.get(product_id)
        if not product or not product.is_active:
            return jsonify({"success": False, "message": "Product not found."}), 404
        cart = Cart.query.filter_by(user_id=user_id).first()
        if not cart:
            cart = Cart(user_id=user_id, total_price=Decimal("0.00"))
            db.session.add(cart)
            db.session.flush()
        cart_item = CartItem.query.filter_by(cart_id=cart.id, product_id=product_id).first()
        new_quantity = quantity + (cart_item.quantity if cart_item else 0)
        if new_quantity > product.stock:
            return jsonify({"success": False, "message": f"Only {product.stock} unit(s) are available."}), 409
        if cart_item:
            cart_item.quantity = new_quantity
        else:
            db.session.add(CartItem(cart_id=cart.id, product_id=product_id, quantity=quantity))
        db.session.flush()
        CartService._recalculate_total(cart)
        db.session.commit()
        return jsonify({"success": True, "message": "Item added/updated in cart."}), 200

    @staticmethod
    def update_cart_item_quantity(user_id, item_id, quantity):
        if isinstance(quantity, bool) or not isinstance(quantity, int) or quantity < 1:
            return jsonify({"success": False, "message": "Quantity must be a positive whole number."}), 400
        cart = Cart.query.filter_by(user_id=user_id).first()
        if not cart:
            return jsonify({"success": False, "message": "Cart not found."}), 404
        cart_item = CartItem.query.filter_by(id=item_id, cart_id=cart.id).first()
        if not cart_item:
            return jsonify({"success": False, "message": "Cart item not found."}), 404
        if not cart_item.product.is_active:
            return jsonify({"success": False, "message": "This product is no longer available."}), 409
        if quantity > cart_item.product.stock:
            return jsonify({"success": False, "message": f"Only {cart_item.product.stock} unit(s) are available."}), 409
        cart_item.quantity = quantity
        CartService._recalculate_total(cart)
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
        cart.cart_items.remove(cart_item)
        db.session.delete(cart_item)
        db.session.flush()
        CartService._recalculate_total(cart)
        db.session.commit()
        return jsonify({"success": True, "message": "Cart item deleted."}), 200

    @staticmethod
    def _recalculate_total(cart):
        cart.total_price = CartService._calculate_total(cart)

    @staticmethod
    def _calculate_total(cart):
        return sum(
            (Decimal(item.product.price) * item.quantity for item in cart.cart_items),
            Decimal("0.00"),
        )

    @staticmethod
    def consume_ordered_items(cart, purchased_items):
        if not cart:
            return
        purchased_quantities = {}
        for product_id, quantity in purchased_items:
            purchased_quantities[product_id] = purchased_quantities.get(product_id, 0) + quantity

        for cart_item in list(cart.cart_items):
            purchased_quantity = purchased_quantities.get(cart_item.product_id, 0)
            if not purchased_quantity:
                continue
            if purchased_quantity >= cart_item.quantity:
                cart.cart_items.remove(cart_item)
                db.session.delete(cart_item)
            else:
                cart_item.quantity -= purchased_quantity

        db.session.flush()
        CartService._recalculate_total(cart)