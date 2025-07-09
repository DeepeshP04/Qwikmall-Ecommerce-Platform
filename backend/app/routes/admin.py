from flask import Blueprint, request, jsonify, session
from app.utils.helpers import admin_required
from app.services.admin_service import AdminService

admin_bp = Blueprint('admin', __name__, url_prefix='/admin')

# Product Management
@admin_bp.route('/products', methods=['POST'])
@admin_required
def add_product():
    data = request.get_json()
    response, status = AdminService.add_product(data)
    return jsonify(response), status

@admin_bp.route('/products/<int:product_id>', methods=['PATCH'])
@admin_required
def update_product(product_id):
    data = request.get_json()
    response, status = AdminService.update_product(product_id, data)
    return jsonify(response), status

@admin_bp.route('/products/<int:product_id>', methods=['DELETE'])
@admin_required
def delete_product(product_id):
    response, status = AdminService.delete_product(product_id)
    return jsonify(response), status

# Order Management
@admin_bp.route('/orders', methods=['GET'])
@admin_required
def get_all_orders():
    response, status = AdminService.get_all_orders()
    return jsonify(response), status

@admin_bp.route('/orders/<int:order_id>', methods=['PATCH'])
@admin_required
def update_order_status(order_id):
    data = request.get_json()
    response, status = AdminService.update_order_status(order_id, data)
    return jsonify(response), status

# User Management
@admin_bp.route('/users', methods=['GET'])
@admin_required
def get_all_users():
    response, status = AdminService.get_all_users()
    return jsonify(response), status

@admin_bp.route('/admins/me', methods=['GET'])
@admin_required
def get_admin_profile():
    response, status = AdminService.get_admin_profile()
    return jsonify(response), status

@admin_bp.route('/users/<int:user_id>', methods=['GET'])
@admin_required
def get_user(user_id):
    response, status = AdminService.get_user(user_id)
    return jsonify(response), status