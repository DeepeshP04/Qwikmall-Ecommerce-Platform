import json

from flask import Blueprint, jsonify, request, session
from app.utils.helpers import admin_required, login_required
from app.services.admin_service import AdminService

admin_bp = Blueprint('admin', __name__, url_prefix='/admin')


def _product_request_data():
    if request.mimetype != "multipart/form-data":
        return request.get_json(silent=True), [], None

    try:
        data = json.loads(request.form.get("product", ""))
    except json.JSONDecodeError:
        return None, [], (jsonify({
            "success": False,
            "message": "Product details must be valid JSON.",
        }), 400)

    if not isinstance(data, dict):
        return None, [], (jsonify({
            "success": False,
            "message": "A product object is required.",
        }), 400)

    return data, request.files.getlist("images"), None


@admin_bp.route('/login', methods=['POST'], strict_slashes=False)
def admin_login():
    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        return {"success": False, "message": "A login object is required."}, 400
    return AdminService.login(data.get("identifier"), data.get("password"))

# Product Management
@admin_bp.route('/products', methods=['POST'], strict_slashes=False)
@login_required
@admin_required
def add_product():
    data, image_files, error = _product_request_data()
    if error:
        return error
    return AdminService.add_product(data, session["user"]["user_id"], image_files)

@admin_bp.route('/products/<int:product_id>', methods=['PATCH'], strict_slashes=False)
@login_required
@admin_required
def update_product(product_id):
    data, image_files, error = _product_request_data()
    if error:
        return error
    return AdminService.update_product(product_id, data, session["user"]["user_id"], image_files)

@admin_bp.route('/products/<int:product_id>', methods=['DELETE'], strict_slashes=False)
@login_required
@admin_required
def delete_product(product_id):
    return AdminService.delete_product(product_id)

# Order Management
@admin_bp.route('/inventory', methods=['GET'], strict_slashes=False)
@login_required
@admin_required
def get_inventory():
    return AdminService.get_inventory()

@admin_bp.route('/orders', methods=['GET'], strict_slashes=False)
@login_required
@admin_required
def get_all_orders():
    return AdminService.get_all_orders()

@admin_bp.route('/orders/<int:order_id>', methods=['PATCH'], strict_slashes=False)
@login_required
@admin_required
def update_order_status(order_id):
    data = request.get_json()
    return AdminService.update_order_status(order_id, data, session["user"]["user_id"])

# User Management
@admin_bp.route('/users', methods=['GET'], strict_slashes=False)
@login_required
@admin_required
def get_all_users():
    return AdminService.get_all_users()

@admin_bp.route('/users/<int:user_id>', methods=['GET'], strict_slashes=False)
@login_required
@admin_required
def get_user(user_id):
    return AdminService.get_user(user_id)

@admin_bp.route('/me', methods=['GET'], strict_slashes=False)
@login_required
@admin_required
def get_admin_profile():
    user_id = session["user"]["user_id"]
    return AdminService.get_admin_profile(user_id)


@admin_bp.route('/categories', methods=['GET'], strict_slashes=False)
@login_required
@admin_required
def get_categories():
    return AdminService.get_categories()


@admin_bp.route('/categories', methods=['POST'], strict_slashes=False)
@login_required
@admin_required
def create_category():
    return AdminService.save_category(request.get_json(silent=True))


@admin_bp.route('/categories/<int:category_id>', methods=['PATCH'], strict_slashes=False)
@login_required
@admin_required
def update_category(category_id):
    return AdminService.save_category(request.get_json(silent=True), category_id)


@admin_bp.route('/categories/<int:category_id>', methods=['DELETE'], strict_slashes=False)
@login_required
@admin_required
def delete_category(category_id):
    return AdminService.delete_category(category_id)


@admin_bp.route('/reviews', methods=['GET'], strict_slashes=False)
@login_required
@admin_required
def get_reviews():
    return AdminService.get_reviews()


@admin_bp.route('/reviews/<int:review_id>', methods=['PATCH'], strict_slashes=False)
@login_required
@admin_required
def update_review(review_id):
    return AdminService.update_review(review_id, request.get_json(silent=True))


@admin_bp.route('/reviews/<int:review_id>', methods=['DELETE'], strict_slashes=False)
@login_required
@admin_required
def delete_review(review_id):
    return AdminService.delete_review(review_id)


@admin_bp.route('/settings', methods=['GET'], strict_slashes=False)
@login_required
@admin_required
def get_store_settings():
    return AdminService.get_store_settings()


@admin_bp.route('/settings', methods=['PATCH'], strict_slashes=False)
@login_required
@admin_required
def update_store_settings():
    return AdminService.update_store_settings(request.get_json(silent=True))