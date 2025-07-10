from flask import Blueprint, request, session
from app.utils.helpers import admin_required
from app.services.admin_service import AdminService

admin_bp = Blueprint('admin', __name__, url_prefix='/admin')

# Product Management
@admin_bp.route('/products', methods=['POST'])
@admin_required
def add_product():
    data = request.get_json()
    return AdminService.add_product(data)

@admin_bp.route('/products/<int:product_id>', methods=['PATCH'])
@admin_required
def update_product(product_id):
    data = request.get_json()
    return AdminService.update_product(product_id, data)

@admin_bp.route('/products/<int:product_id>', methods=['DELETE'])
@admin_required
def delete_product(product_id):
    return AdminService.delete_product(product_id)

# Order Management
@admin_bp.route('/orders', methods=['GET'])
@admin_required
def get_all_orders():
    return AdminService.get_all_orders()

@admin_bp.route('/orders/<int:order_id>', methods=['PATCH'])
@admin_required
def update_order_status(order_id):
    data = request.get_json()
    return AdminService.update_order_status(order_id, data)

# User Management
@admin_bp.route('/users', methods=['GET'])
@admin_required
def get_all_users():
    return AdminService.get_all_users()

@admin_bp.route('/admins/me', methods=['GET'])
@admin_required
def get_admin_profile():
    return AdminService.get_admin_profile()

@admin_bp.route('/users/<int:user_id>', methods=['GET'])
@admin_required
def get_user(user_id):
    return AdminService.get_user(user_id)