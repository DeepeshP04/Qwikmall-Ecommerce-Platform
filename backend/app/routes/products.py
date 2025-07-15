from flask import Blueprint, request
from app.services.product_service import ProductService

product_bp = Blueprint("products", __name__, url_prefix="/products")

@product_bp.route("/recommended", methods=["GET"], strict_slashes=False)
def get_recommended_products():
    return ProductService.get_recommended_products()

@product_bp.route("/category/<category_name>", methods=["GET"], strict_slashes=False)
def get_products_by_category(category_name):
    return ProductService.get_products_by_category(category_name)

@product_bp.route("", methods=["GET"], strict_slashes=False)
def get_all_products():
    search_query = request.args.get('query')
    return ProductService.get_all_products(search_query)

@product_bp.route("/<int:product_id>", methods=["GET"], strict_slashes=False)
def get_product_by_id(product_id):
    return ProductService.get_product_by_id(product_id)

@product_bp.route("/category/<category_name>/filters", methods=["GET"], strict_slashes=False)
def get_category_filters(category_name):
    return ProductService.get_category_filters(category_name)

@product_bp.route("/filters", methods=["GET"], strict_slashes=False)
def get_all_filters():
    return ProductService.get_all_filters()