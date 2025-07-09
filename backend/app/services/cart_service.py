from app.models import Cart, CartItem, Product, ProductAttribute, ProductAttributeValue, ProductImage
from app import db

class CartService:
    @staticmethod
    def get_user_cart(user_id):
        cart = Cart.query.filter_by(user_id=user_id).first()
        if not cart:
            return False, {"Success": False, "Message": "Cart does not exist. Please add items to the cart"}, 404
        # Build cart items with product details and attributes
        cart_items = []
        for item in cart.cart_items:
            product = Product.query.get(item.product_id)
            # Get primary image
            primary_image = ProductImage.query.filter_by(product_id=product.id, is_primary=True).first()
            # Get attributes
            attr_pairs = db.session.query(ProductAttribute.name, ProductAttributeValue.value) \
                .join(ProductAttribute, ProductAttributeValue.attribute_id == ProductAttribute.id) \
                .filter(ProductAttributeValue.product_id == product.id).all()
            attributes = {name: value for name, value in attr_pairs}
            cart_items.append({
                "id": item.id,
                "item_qty": item.quantity,
                "product": {
                    "name": product.name,
                    "img": primary_image.image_url if primary_image else None,
                    "price": float(product.price),
                    "attributes": attributes
                }
            })
        cart_data = {
            "id": cart.id,
            "total_price": float(cart.total_price),
            "cart_items": cart_items
        }
        return True, {"Success": True, "data": cart_data}, 200 

    @staticmethod
    def add_or_update_cart_item(user_id, product_id, quantity):
        if quantity <= 0:
            return False, {"success": False, "message": "Quantity must be greater than 0."}, 400
        product = Product.query.get(product_id)
        if not product:
            return False, {"success": False, "message": "Product not found."}, 404
        cart = Cart.query.filter_by(user_id=user_id).first()
        if not cart:
            cart = Cart(user_id=user_id, total_price=0)
            db.session.add(cart)
            db.session.commit()
        cart_item = CartItem.query.filter_by(cart_id=cart.id, product_id=product_id).first()
        if cart_item:
            cart_item.quantity += quantity
        else:
            cart_item = CartItem(cart_id=cart.id, product_id=product_id, quantity=quantity)
            db.session.add(cart_item)
        cart.update_total_price()
        db.session.commit()
        return True, {"success": True, "message": "Product added to cart"}, 201 

    @staticmethod
    def update_cart_item_quantity(user_id, item_id, quantity):
        if quantity <= 0:
            return False, {"success": False, "message": "Quantity must be greater than 0."}, 400
        cart = Cart.query.filter_by(user_id=user_id).first()
        if not cart:
            return False, {"Success": False, "Message": "Item does not exist"}, 404
        cart_item = CartItem.query.filter_by(id=item_id, cart_id=cart.id).first()
        if not cart_item:
            return False, {"Success": False, "Message": "Item does not exist"}, 404
        cart_item.quantity = quantity
        cart.update_total_price()
        db.session.commit()
        return True, {"success": True, "message": "Cart updated successfully"}, 200 

    @staticmethod
    def delete_cart_item(user_id, item_id):
        cart = Cart.query.filter_by(user_id=user_id).first()
        if not cart:
            return False, {"Success": False, "Message": "Cart item does not exist"}, 404
        cart_item = CartItem.query.filter_by(id=item_id, cart_id=cart.id).first()
        if not cart_item:
            return False, {"Success": False, "Message": "Cart item does not exist"}, 404
        db.session.delete(cart_item)
        cart.update_total_price()
        db.session.commit()
        return True, {"success": True, "message": "Cart item deleted successfully"}, 200 