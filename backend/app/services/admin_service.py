import hmac
import os
import uuid

from flask import current_app, jsonify, session, url_for
from sqlalchemy import func, or_

from app.models import InventoryMovement, Product, Order, OrderStatusHistory, User
from app import db
from app.models import ProductImage, ProductAttribute, ProductAttributeValue, Category
from app.services.inventory_service import InventoryService

class AdminService:
    MAX_PRODUCT_IMAGES = 10
    MAX_PRODUCT_IMAGE_SIZE = 5 * 1024 * 1024
    ALLOWED_PRODUCT_IMAGE_EXTENSIONS = {".gif", ".jpeg", ".jpg", ".png", ".webp"}

    @staticmethod
    def _save_product_images(image_files):
        if len(image_files) > AdminService.MAX_PRODUCT_IMAGES:
            raise ValueError("A product can have up to 10 images.")

        image_directory = os.path.join(current_app.static_folder, "images", "products")
        os.makedirs(image_directory, exist_ok=True)
        saved_paths = []
        image_urls = []

        try:
            for image_file in image_files:
                extension = os.path.splitext(image_file.filename or "")[1].lower()
                if extension not in AdminService.ALLOWED_PRODUCT_IMAGE_EXTENSIONS:
                    raise ValueError("Images must be JPG, PNG, WEBP, or GIF files.")

                image_contents = image_file.stream.read(AdminService.MAX_PRODUCT_IMAGE_SIZE + 1)
                if len(image_contents) > AdminService.MAX_PRODUCT_IMAGE_SIZE:
                    raise ValueError("Each product image must be 5 MB or smaller.")
                if not image_contents:
                    raise ValueError("Product images cannot be empty.")

                filename = f"{uuid.uuid4().hex}{extension}"
                image_path = os.path.join(image_directory, filename)
                with open(image_path, "wb") as saved_image:
                    saved_image.write(image_contents)
                saved_paths.append(image_path)
                image_urls.append(url_for(
                    "static",
                    filename=f"images/products/{filename}",
                    _external=True,
                ))
        except (OSError, ValueError):
            for image_path in saved_paths:
                if os.path.exists(image_path):
                    os.remove(image_path)
            raise

        return image_urls, saved_paths

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
                "price": float(product.price),
                "description": product.description,
                "manufacturer": product.manufacturer,
                "brand": product.brand,
                "category": product.category.name if product.category else "",
                "images": [
                    {
                        "id": image.id,
                        "image_url": image.image_url,
                        "is_primary": image.is_primary,
                    }
                    for image in sorted(
                        product.images,
                        key=lambda image: (not image.is_primary, image.id),
                    )
                ],
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
    def add_product(data, actor_id=None, image_files=None):
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
        if not isinstance(data["description"], str) or len(data["description"]) > 2000:
            return jsonify({"success": False, "message": "Description must be 2000 characters or fewer."}), 400
        if not isinstance(data["name"], str) or len(data["name"]) > 50:
            return jsonify({"success": False, "message": "Product name must be 50 characters or fewer."}), 400
        if not isinstance(data["manufacturer"], str) or len(data["manufacturer"]) > 50:
            return jsonify({"success": False, "message": "Manufacturer must be 50 characters or fewer."}), 400
        if not isinstance(data["category"], str) or len(data["category"]) > 50:
            return jsonify({"success": False, "message": "Category must be 50 characters or fewer."}), 400
        brand = data.get("brand", "")
        if not isinstance(brand, str) or len(brand) > 50:
            return jsonify({"success": False, "message": "Brand must be 50 characters or fewer."}), 400
        images = data.get("images", [])
        if not isinstance(images, list) or any(
            not isinstance(img_url, str) or len(img_url) > 200 for img_url in images
        ):
            return jsonify({"success": False, "message": "Images must be a list of URLs up to 200 characters long."}), 400
        image_files = image_files or []
        if len(images) + len(image_files) > AdminService.MAX_PRODUCT_IMAGES:
            return jsonify({"success": False, "message": "A product can have up to 10 images."}), 400
        try:
            uploaded_image_urls, _ = AdminService._save_product_images(image_files)
        except ValueError as image_error:
            return jsonify({"success": False, "message": str(image_error)}), 400
        except OSError:
            return jsonify({"success": False, "message": "Unable to store product images."}), 500

        category = Category.query.filter_by(name=data["category"]).first()
        if not category:
            category = Category(name=data["category"])
            db.session.add(category)
            db.session.flush()
        product = Product(
            name=data["name"],
            price=price,
            description=data["description"],
            manufacturer=data["manufacturer"],
            brand=brand,
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
        images.extend(uploaded_image_urls)
        for image_index, img_url in enumerate(images):
            db.session.add(ProductImage(
                product_id=product.id,
                image_url=img_url,
                is_primary=image_index == 0,
            ))
        attributes = data.get("attributes", {})
        for attr_name, attr_value in attributes.items():
            attr = ProductAttribute.query.filter_by(name=attr_name).first()
            if not attr:
                attr = ProductAttribute(name=attr_name)
                db.session.add(attr)
                db.session.flush()
            pav = ProductAttributeValue(product_id=product.id, attribute_id=attr.id, value=attr_value)
            db.session.add(pav)
        db.session.commit()
        return jsonify({"success": True, "message": "Product added successfully."}), 201

    @staticmethod
    def update_product(product_id, data, actor_id=None, image_files=None):
        if not isinstance(data, dict) or not data:
            return jsonify({"success": False, "message": "A product update object is required."}), 400
        product = Product.query.filter_by(id=product_id).with_for_update().first()
        if not product:
            return jsonify({"success": False, "message": "Product does not exist"}), 404
        field_limits = {
            "name": 50,
            "manufacturer": 50,
            "brand": 50,
            "description": 2000,
            "category": 50,
        }
        for field, max_length in field_limits.items():
            if field in data and (
                not isinstance(data[field], str) or len(data[field]) > max_length
            ):
                return jsonify({
                    "success": False,
                    "message": f"{field.capitalize()} must be a string of at most {max_length} characters.",
                }), 400

        keep_image_ids = data.get("keep_image_ids")
        if keep_image_ids is not None and (
            not isinstance(keep_image_ids, list)
            or any(isinstance(image_id, bool) or not isinstance(image_id, int) for image_id in keep_image_ids)
        ):
            return jsonify({"success": False, "message": "Image IDs must be a list of integers."}), 400

        image_files = image_files or []
        if image_files and keep_image_ids is None:
            return jsonify({"success": False, "message": "Image IDs must be provided when updating product images."}), 400
        if keep_image_ids is not None and len(keep_image_ids) + len(image_files) > AdminService.MAX_PRODUCT_IMAGES:
            return jsonify({"success": False, "message": "A product can have up to 10 images."}), 400

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
                    db.session.flush()
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
            elif field.lower() in {"keep_image_ids", "images"}:
                continue
            elif hasattr(product, field.lower()):
                setattr(product, field.lower(), value)

        if keep_image_ids is not None:
            try:
                uploaded_image_urls, _ = AdminService._save_product_images(image_files)
            except ValueError as image_error:
                db.session.rollback()
                return jsonify({"success": False, "message": str(image_error)}), 400
            except OSError:
                db.session.rollback()
                return jsonify({"success": False, "message": "Unable to store product images."}), 500

            current_images = ProductImage.query.filter_by(product_id=product.id).all()
            for image in current_images:
                if image.id not in keep_image_ids:
                    db.session.delete(image)
            retained_images = [image for image in current_images if image.id in keep_image_ids]
            if retained_images and not any(image.is_primary for image in retained_images):
                retained_images[0].is_primary = True
            for image_index, image_url in enumerate(uploaded_image_urls):
                db.session.add(ProductImage(
                    product_id=product.id,
                    image_url=image_url,
                    is_primary=not retained_images and image_index == 0,
                ))
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
                "email": u.email,
                "role": u.role,
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