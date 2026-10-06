import hmac
import os

from flask import session, jsonify
from sqlalchemy import func, or_

from app.models import Product, Order, User
from app import db
from app.models import ProductImage, ProductAttribute, ProductAttributeValue, Category

class AdminService:
    @staticmethod
    def login(identifier, password):
        configured_password = os.getenv("ADMIN_PASSWORD")
        if not configured_password:
            return jsonify({
                "success": False,
                "message": "Admin login is not configured on the server.",
            }), 503

        if not isinstance(identifier, str) or not isinstance(password, str):
            return jsonify({
                "success": False,
                "message": "Enter your admin email or phone and password.",
            }), 400

        identifier = identifier.strip()
        if not identifier or not password:
            return jsonify({
                "success": False,
                "message": "Enter your admin email or phone and password.",
            }), 400

        password_matches = hmac.compare_digest(
            password.encode("utf-8"),
            configured_password.encode("utf-8"),
        )
        admin = User.query.filter(
            User.role == "admin",
            or_(
                User.phone == identifier,
                func.lower(User.email) == identifier.lower(),
            ),
        ).first()

        if not admin or not password_matches:
            return jsonify({
                "success": False,
                "message": "Invalid admin email/phone or password.",
            }), 401

        session["user"] = {
            "user_id": admin.id,
            "username": admin.username,
            "role": admin.role,
            "logged_in": True,
        }
        return jsonify({
            "success": True,
            "message": "Admin logged in successfully.",
        }), 200

    @staticmethod
    def add_product(data):
        required_fields = ["name", "description", "price", "manufacturer", "category"]
        for field in required_fields:
            if not data.get(field):
                return jsonify({"success": False, "message": "Missing required field."}), 400
        try:
            price = float(data["price"])
            if price <= 0:
                return jsonify({"success": False, "message": "Price must be greater than 0."}), 400
        except Exception:
            return jsonify({"success": False, "message": "Invalid price value."}), 400
        category = Category.query.filter_by(name=data["category"]).first()
        if not category:
            category = Category(name=data["category"])
            db.session.add(category)
            db.session.commit()
        product = Product(
            name=data["name"],
            price=price,
            description=data["description"],
            manufacturer=data["manufacturer"],
            category_id=category.id
        )
        db.session.add(product)
        db.session.commit()
        images = data.get("images", [])
        for img_url in images:
            img = ProductImage(product_id=product.id, image_url=img_url, is_primary=False)
            db.session.add(img)
        if images:
            ProductImage.query.filter_by(product_id=product.id, image_url=images[0]).update({"is_primary": True})
        attributes = data.get("attributes", {})
        for attr_name, attr_value in attributes.items():
            attr = ProductAttribute.query.filter_by(name=attr_name).first()
            if not attr:
                attr = ProductAttribute(name=attr_name)
                db.session.add(attr)
                db.session.commit()
            pav = ProductAttributeValue(product_id=product.id, attribute_id=attr.id, value=attr_value)
            db.session.add(pav)
        db.session.commit()
        return jsonify({"success": True, "message": "Product added successfully."}), 201

    @staticmethod
    def update_product(product_id, data):
        product = Product.query.get(product_id)
        if not product:
            return jsonify({"success": False, "message": "Product does not exist"}), 404
        for field, value in data.items():
            if field.lower() == "price":
                try:
                    value = float(value)
                    if value <= 0:
                        return jsonify({"success": False, "message": "Price must be greater than 0."}), 400
                except Exception:
                    return jsonify({"success": False, "message": "Invalid price value."}), 400
                setattr(product, "price", value)
            elif field.lower() == "category":
                category = Category.query.filter_by(name=value).first()
                if not category:
                    category = Category(name=value)
                    db.session.add(category)
                    db.session.commit()
                product.category_id = category.id
            elif hasattr(product, field.lower()):
                setattr(product, field.lower(), value)
        db.session.commit()
        return jsonify({"success": True, "message": "Product details updated successfully."}), 200

    @staticmethod
    def delete_product(product_id):
        product = Product.query.get(product_id)
        if not product:
            return jsonify({"success": False, "message": "Product does not exist"}), 404
        db.session.delete(product)
        db.session.commit()
        return jsonify({"success": True, "message": "Product deleted successfully."}), 200

    @staticmethod
    def get_all_orders():
        orders = Order.query.all()
        orders_data = [order.to_dict() for order in orders]
        return jsonify({"success": True, "data": orders_data}), 200

    @staticmethod
    def update_order_status(order_id, data):
        order = Order.query.get(order_id)
        if not order:
            return jsonify({"success": False, "message": "Order does not exist."}), 404
        status = data.get("status")
        if not status:
            return jsonify({"success": False, "message": "Invalid order status."}), 400
        order.status = status
        db.session.commit()
        return jsonify({"success": True, "message": "Order status updated."}), 200

    @staticmethod
    def get_all_users():
        users = User.query.all()
        users_data = [
            {
                "id": u.id,
                "username": u.username,
                "phone": u.phone,
                "email": u.email
            } for u in users
        ]
        return jsonify({"success": True, "data": users_data}), 200

    @staticmethod
    def get_admin_profile(user_id):
        admin = User.query.get(user_id)
        if not admin:
            return jsonify({"success": False, "message": "Admin user not found."}), 404
        admin_data = {
            "id": admin.id,
            "username": admin.username,
            "phone": admin.phone,
            "email": admin.email
        }
        return jsonify({"success": True, "data": admin_data}), 200

    @staticmethod
    def get_user(user_id):
        user_obj = User.query.get(user_id)
        if not user_obj:
            return jsonify({"success": False, "message": "User not found."}), 404
        user_data = {
            "id": user_obj.id,
            "username": user_obj.username,
            "phone": user_obj.phone,
            "email": user_obj.email
        }
        return jsonify({"success": True, "data": user_data}), 200