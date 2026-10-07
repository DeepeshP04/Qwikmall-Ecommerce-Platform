import hmac
import os

from flask import session, jsonify
from sqlalchemy import func, or_

from app.models import InventoryMovement, Product, Order, OrderStatusHistory, User
from app import db
from app.models import ProductImage, ProductAttribute, ProductAttributeValue, Category
from app.services.inventory_service import InventoryService

class AdminService:
    @staticmethod
    def get_inventory():
        products = Product.query.order_by(Product.name.asc()).all()
        inventory_data = [
            {
                "id": product.id,
                "name": product.name,
                "sku": product.sku,
                "stock": product.stock,
                "is_active": product.is_active,
            }
            for product in products
        ]
        return jsonify({"success": True, "data": inventory_data}), 200

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
    def add_product(data, actor_id=None):
        if not isinstance(data, dict):
            return jsonify({"success": False, "message": "A product object is required."}), 400
        required_fields = ["name", "description", "price", "manufacturer", "category"]
        for field in required_fields:
            if not data.get(field):
                return jsonify({"success": False, "message": "Missing required field."}), 400
        stock = data.get("stock", 0)
        if isinstance(stock, bool) or not isinstance(stock, int) or stock < 0:
            return jsonify({"success": False, "message": "Stock must be a non-negative whole number."}), 400
        sku = data.get("sku") or None
        if sku is not None and (not isinstance(sku, str) or len(sku) > 64):
            return jsonify({"success": False, "message": "SKU must be a string of at most 64 characters."}), 400
        if sku and Product.query.filter_by(sku=sku).first():
            return jsonify({"success": False, "message": "That SKU is already in use."}), 409
        try:
            price = float(data["price"])
            if price <= 0:
                return jsonify({"success": False, "message": "Price must be greater than 0."}), 400
        except (TypeError, ValueError):
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
            stock=stock,
            sku=sku,
            category_id=category.id
        )
        db.session.add(product)
        db.session.commit()
        if stock:
            db.session.add(InventoryMovement(
                product_id=product.id,
                quantity_change=stock,
                reason="initial_stock",
                changed_by_id=actor_id,
            ))
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
    def update_product(product_id, data, actor_id=None):
        if not isinstance(data, dict) or not data:
            return jsonify({"success": False, "message": "A product update object is required."}), 400
        product = Product.query.filter_by(id=product_id).with_for_update().first()
        if not product:
            return jsonify({"success": False, "message": "Product does not exist"}), 404
        for field, value in data.items():
            if field.lower() == "stock":
                if isinstance(value, bool) or not isinstance(value, int) or value < 0:
                    return jsonify({"success": False, "message": "Stock must be a non-negative whole number."}), 400
                quantity_change = value - product.stock
                product.stock = value
                if quantity_change:
                    db.session.add(InventoryMovement(
                        product_id=product.id,
                        quantity_change=quantity_change,
                        reason="admin_adjustment",
                        changed_by_id=actor_id,
                    ))
            elif field.lower() == "price":
                try:
                    value = float(value)
                    if value <= 0:
                        return jsonify({"success": False, "message": "Price must be greater than 0."}), 400
                except (TypeError, ValueError):
                    return jsonify({"success": False, "message": "Invalid price value."}), 400
                setattr(product, "price", value)
            elif field.lower() == "category":
                category = Category.query.filter_by(name=value).first()
                if not category:
                    category = Category(name=value)
                    db.session.add(category)
                    db.session.commit()
                product.category_id = category.id
            elif field.lower() == "sku":
                if value is not None and (not isinstance(value, str) or len(value) > 64):
                    return jsonify({"success": False, "message": "SKU must be a string of at most 64 characters."}), 400
                normalized_sku = value or None
                if normalized_sku and Product.query.filter(
                    Product.sku == normalized_sku,
                    Product.id != product.id,
                ).first():
                    return jsonify({"success": False, "message": "That SKU is already in use."}), 409
                product.sku = normalized_sku
            elif field.lower() == "is_active":
                if not isinstance(value, bool):
                    return jsonify({"success": False, "message": "is_active must be a boolean."}), 400
                product.is_active = value
            elif hasattr(product, field.lower()):
                setattr(product, field.lower(), value)
        db.session.commit()
        return jsonify({"success": True, "message": "Product details updated successfully."}), 200

    @staticmethod
    def delete_product(product_id):
        product = Product.query.get(product_id)
        if not product:
            return jsonify({"success": False, "message": "Product does not exist"}), 404
        product.is_active = False
        db.session.commit()
        return jsonify({"success": True, "message": "Product archived successfully."}), 200

    @staticmethod
    def get_all_orders():
        orders = Order.query.all()
        orders_data = [order.to_dict() for order in orders]
        return jsonify({"success": True, "data": orders_data}), 200

    @staticmethod
    def update_order_status(order_id, data, actor_id=None):
        if not isinstance(data, dict):
            return jsonify({"success": False, "message": "An order status object is required."}), 400
        order = Order.query.filter_by(id=order_id).with_for_update().first()
        if not order:
            return jsonify({"success": False, "message": "Order does not exist."}), 404
        status = data.get("status")
        valid_statuses = {"Pending", "Processing", "Shipped", "Delivered", "Cancelled", "Failed"}
        if not isinstance(status, str) or status.strip() not in valid_statuses:
            return jsonify({"success": False, "message": "Invalid order status."}), 400
        status = status.strip()
        previous_status = order.status
        if previous_status == status:
            return jsonify({"success": True, "message": "Order status is unchanged."}), 200
        terminal_statuses = {"Cancelled", "Failed"}
        if previous_status in terminal_statuses:
            return jsonify({"success": False, "message": "A cancelled or failed order cannot be reopened."}), 400
        if status in terminal_statuses:
            if previous_status not in {"Pending", "Processing"}:
                return jsonify({
                    "success": False,
                    "message": "Only pending or processing orders can be cancelled or marked failed.",
                }), 400
            InventoryService.restore_order_items(order, actor_id)
            for payment in order.payments:
                if payment.status == "Pending":
                    payment.status = status
        order.status = status
        db.session.add(OrderStatusHistory(
            order_id=order.id,
            previous_status=previous_status,
            status=status,
            changed_by_id=actor_id,
        ))
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