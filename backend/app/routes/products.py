from flask import Blueprint, request, jsonify
from app.services.product_service import ProductService

product_bp = Blueprint("products", __name__, url_prefix="/products")
product_service = ProductService()

@product_bp.route("/recommended", methods=["GET"])
def get_recommended_products():
    """Get 5 products from each category for home page"""
    success, data = product_service.get_recommended_products()
    
    if success:
        return jsonify({
            "success": True,
            "data": data
        }), 200
    else:
        return jsonify({
            "success": False,
            "message": data
        }), 500

@product_bp.route("/category/<category_name>", methods=["GET"])
def get_products_by_category(category_name):
    """Get all products of a specific category"""
    success, data = product_service.get_products_by_category(category_name)
    
    if success:
        return jsonify({
            "success": True,
            "data": data
        }), 200
    else:
        if data == "Category does not exist":
            return jsonify({
                "success": False,
                "message": data
            }), 404
        else:
            return jsonify({
                "success": False,
                "message": data
            }), 500

@product_bp.route("", methods=["GET"])
def get_all_products():
    """Get all products with optional search"""
    search_query = request.args.get('q')
    success, data = product_service.get_all_products(search_query)
    
    if success:
        return jsonify({
            "success": True,
            "data": data
        }), 200
    else:
        return jsonify({
            "success": False,
            "message": data
        }), 500

@product_bp.route("/<int:product_id>", methods=["GET"])
def get_product_by_id(product_id):
    """Get specific product details"""
    success, data = product_service.get_product_by_id(product_id)
    
    if success:
        return jsonify({
            "success": True,
            "data": data
        }), 200
    else:
        if data == "Product does not exist":
            return jsonify({
                "success": False,
                "message": data
            }), 404
        else:
            return jsonify({
                "success": False,
                "message": data
            }), 500

@product_bp.route("/category/<category_name>/filters", methods=["GET"])
def get_category_filters(category_name):
    """Get filter options for products in a category"""
    success, data = product_service.get_category_filters(category_name)
    
    if success:
        return jsonify({
            "success": True,
            "data": data
        }), 200
    else:
        if data == "Category does not exist":
            return jsonify({
                "success": False,
                "message": data
            }), 404
        else:
            return jsonify({
                "success": False,
                "message": data
            }), 500

@product_bp.route("/filters", methods=["GET"])
def get_all_filters():
    """Get filter options for all products"""
    success, data = product_service.get_category_filters()
    
    if success:
        return jsonify({
            "success": True,
            "data": data
        }), 200
    else:
        return jsonify({
            "success": False,
            "message": data
        }), 500

# Post a new product (Admin only)

# Update product (Admin only)

# Delete product (Admin only)