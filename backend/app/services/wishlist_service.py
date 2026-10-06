from flask import jsonify

from app import db
from app.models import Product, WishlistItem


class WishlistService:
    @staticmethod
    def get_user_wishlist(user_id):
        wishlist_items = (
            WishlistItem.query.filter_by(user_id=user_id)
            .order_by(WishlistItem.created_at.desc(), WishlistItem.id.desc())
            .all()
        )
        return jsonify({
            "success": True,
            "data": [WishlistService._to_dict(item) for item in wishlist_items],
        }), 200

    @staticmethod
    def add_item(user_id, product_id):
        if not isinstance(product_id, int) or isinstance(product_id, bool):
            return jsonify({"success": False, "message": "A valid product_id is required."}), 400

        product = Product.query.get(product_id)
        if not product:
            return jsonify({"success": False, "message": "Product not found."}), 404

        existing_item = WishlistItem.query.filter_by(
            user_id=user_id,
            product_id=product_id,
        ).first()
        if existing_item:
            return jsonify({
                "success": True,
                "message": "Product is already in your wishlist.",
                "data": WishlistService._to_dict(existing_item),
            }), 200

        item = WishlistItem(user_id=user_id, product_id=product_id)
        db.session.add(item)
        db.session.commit()
        return jsonify({
            "success": True,
            "message": "Product added to your wishlist.",
            "data": WishlistService._to_dict(item),
        }), 201

    @staticmethod
    def remove_item(user_id, item_id):
        item = WishlistItem.query.filter_by(id=item_id, user_id=user_id).first()
        if not item:
            return jsonify({"success": False, "message": "Wishlist item not found."}), 404

        db.session.delete(item)
        db.session.commit()
        return jsonify({"success": True, "message": "Product removed from your wishlist."}), 200

    @staticmethod
    def _to_dict(item):
        product = item.product
        primary_image = next(
            (image for image in product.images if image.is_primary),
            product.images[0] if product.images else None,
        )
        return {
            "id": item.id,
            "created_at": item.created_at.isoformat() if item.created_at else None,
            "product": {
                "id": product.id,
                "name": product.name,
                "price": float(product.price),
                "manufacturer": product.manufacturer,
                "image_url": primary_image.image_url if primary_image else None,
                "image_alt_text": primary_image.alt_text if primary_image else None,
            },
        }
