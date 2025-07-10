from flask import Blueprint, request
from app.services.product_service import ProductService

product_bp = Blueprint("products", __name__, url_prefix="/products")
product_service = ProductService()

@product_bp.route("/recommended", methods=["GET"])
def get_recommended_products():
    return product_service.get_recommended_products()

@product_bp.route("/category/<category_name>", methods=["GET"])
def get_products_by_category(category_name):
    return product_service.get_products_by_category(category_name)

@product_bp.route("", methods=["GET"])
def get_all_products():
    search_query = request.args.get('q')
    return product_service.get_all_products(search_query)

@product_bp.route("/<int:product_id>", methods=["GET"])
def get_product_by_id(product_id):
    return product_service.get_product_by_id(product_id)

@product_bp.route("/category/<category_name>/filters", methods=["GET"])
def get_category_filters(category_name):
    return product_service.get_category_filters(category_name)

@product_bp.route("/filters", methods=["GET"])
def get_all_filters():
    return product_service.get_category_filters()

# Post a new product (Admin only)

# Update product (Admin only)

# Delete product (Admin only)