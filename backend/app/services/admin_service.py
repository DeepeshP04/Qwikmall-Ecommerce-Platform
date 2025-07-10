from flask import session, jsonify
from app.models import Product, Order, User, db
from app.models import ProductImage, ProductAttribute, ProductAttributeValue, Category

class AdminService:
    @staticmethod
    def add_product(data):
        user = session.get("user")
        if not user:
            return jsonify({"Success": False, "Message": "Please login."}), 401
        if user.get("role") != "admin":
            return jsonify({"Success": False, "Message": "Only admin can add products."}), 403
        required_fields = ["Name", "Description", "Price", "Manufacturer", "Category"]
        for field in required_fields:
            if not data.get(field):
                return jsonify({"Success": False, "Message": "Missing required field."}), 400
        try:
            price = float(data["Price"])
            if price <= 0:
                return jsonify({"Success": False, "Message": "Price must be greater than 0."}), 400
        except Exception:
            return jsonify({"Success": False, "Message": "Invalid price value."}), 400
        category = Category.query.filter_by(name=data["Category"]).first()
        if not category:
            category = Category(name=data["Category"])
            db.session.add(category)
            db.session.commit()
        product = Product(
            name=data["Name"],
            price=price,
            description=data["Description"],
            manufacturer=data["Manufacturer"],
            category_id=category.id
        )
        db.session.add(product)
        db.session.commit()
        images = data.get("Images", [])
        for img_url in images:
            img = ProductImage(product_id=product.id, image_url=img_url, is_primary=False)
            db.session.add(img)
        if images:
            ProductImage.query.filter_by(product_id=product.id, image_url=images[0]).update({"is_primary": True})
        attributes = data.get("Attributes", {})
        for attr_name, attr_value in attributes.items():
            attr = ProductAttribute.query.filter_by(name=attr_name).first()
            if not attr:
                attr = ProductAttribute(name=attr_name)
                db.session.add(attr)
                db.session.commit()
            pav = ProductAttributeValue(product_id=product.id, attribute_id=attr.id, value=attr_value)
            db.session.add(pav)
        db.session.commit()
        return jsonify({"Success": True, "Message": "Product added successfully."}), 201

    @staticmethod
    def update_product(product_id, data):
        user = session.get("user")
        if not user:
            return jsonify({"success": False, "message": "Please login."}), 401
        if user.get("role") != "admin":
            return jsonify({"success": False, "message": "Only admin can update products."}), 403
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
        user = session.get("user")
        if not user:
            return jsonify({"success": False, "message": "Please login."}), 401
        if user.get("role") != "admin":
            return jsonify({"success": False, "message": "Only admin can delete products."}), 403
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
        return jsonify({"success": True, "orders": orders_data}), 200

    @staticmethod
    def update_order_status(order_id, data):
        user = session.get("user")
        if not user:
            return jsonify({"Success": False, "Message": "Please login."}), 401
        if user.get("role") != "admin":
            return jsonify({"Success": False, "Message": "Only admin can update order status."}), 403
        order = Order.query.get(order_id)
        if not order:
            return jsonify({"Success": False, "Message": "Order does not exist."}), 404
        status = data.get("Status")
        if not status:
            return jsonify({"Success": False, "Message": "Invalid order status."}), 400
        order.status = status
        db.session.commit()
        return jsonify({"Success": True, "Message": "Order status updated."}), 200

    @staticmethod
    def get_all_users():
        user = session.get("user")
        if not user:
            return jsonify({"Success": False, "Message": "Please login."}), 401
        if user.get("role") not in ["admin", "super_admin"]:
            return jsonify({"Success": False, "Message": "Only admin or super admin can access."}), 403
        users = User.query.all()
        users_data = [
            {
                "Id": u.id,
                "Username": u.username,
                "Phone": u.phone,
                "Email": u.email
            } for u in users
        ]
        return jsonify({"Success": True, "data": users_data}), 200

    @staticmethod
    def get_admin_profile():
        user = session.get("user")
        if not user:
            return jsonify({"Success": False, "Message": "Please login."}), 401
        if user.get("role") not in ["admin", "super_admin"]:
            return jsonify({"Success": False, "Message": "Only admin can access."}), 403
        admin = User.query.get(user["user_id"])
        if not admin or admin.role not in ["admin", "super_admin"]:
            return jsonify({"Success": False, "Message": "Admin does not exist."}), 404
        admin_data = {
            "Id": admin.id,
            "Username": admin.username,
            "Phone": admin.phone,
            "Email": admin.email
        }
        return jsonify({"Success": True, "data": admin_data}), 200

    @staticmethod
    def get_user(user_id):
        user = session.get("user")
        if not user:
            return jsonify({"Success": False, "Message": "Please login."}), 401
        if user.get("role") not in ["admin", "super_admin"]:
            return jsonify({"Success": False, "Message": "Only admin or super admin can access."}), 403
        user_obj = User.query.get(user_id)
        if not user_obj:
            return jsonify({"Success": False, "Message": "User not found."}), 404
        user_data = {
            "Id": user_obj.id,
            "Username": user_obj.username,
            "Phone": user_obj.phone,
            "Email": user_obj.email
        }
        return jsonify({"Success": True, "data": user_data}), 200