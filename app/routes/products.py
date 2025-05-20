from flask import Blueprint, jsonify
from app.models import Category, Product

product_bp = Blueprint("products", __name__, url_prefix="/products")

# Recommended products for home page
# For now, this is a static list of products
# In the future, this will be replaced with recommended products for user
@product_bp.route("/recommended-products", methods=["GET"])
def get_recommended_products():
    try:
        # Fetch all categories
        categories = Category.query.all()
        recommended_products = {"categories": []}
        
        for category in categories:
            products = Product.query.filter_by(category_id=category.id).limit(5).all()
    
            recommended_products["categories"].append({
                "id": category.id,
                "name": category.name,
                "description": category.description,
                "products": [
                    {
                        "id": prod.id,
                        "name": prod.name,
                        "price": prod.price,
                        "description": prod.description,
                        "image": prod.image,
                        "stock": prod.stock,
                        "manufacturer": prod.manufacturer
                    }
                    for prod in products
                ]
            })
        # Return the JSON response of products
        return jsonify(recommended_products), 200
    except Exception as e:
        # Handle any exceptions that occur during the process
        return jsonify({"error": str(e)}), 500

# All products of a category
@product_bp.route("/products/category/<int:category_id>", methods=["GET"])
def get_products_by_category(category_id):
    try:
        products = Product.query.filter_by(category_id=category_id).all()
        response_data = {
            "products": [
                {
                    "id": product.id,
                    "name": product.name,
                    "price": product.price,
                    "description": product.description,
                    "image_url": product.image,
                    "stock": product.stock,
                    "manufacturer": product.manufacturer
                }
                for product in products
            ]
        }
    
        return jsonify(response_data), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
# List all products
@product_bp.route("/products", methods=["GET"])
def get_all_products():
    try:
        products = Product.query.all()
        response_data = {
            "products": [
                {
                    "id": product.id,
                    "name": product.name,
                    "price": product.price,
                    "description": product.description,
                    "image_url": product.image,
                    "stock": product.stock,
                    "manufacturer": product.manufacturer
                }
                for product in products
            ]
        }
    
        return jsonify(response_data), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Get a product by id or get details of a specific product
@product_bp.route("/products/<int:product_id>", methods=["GET"])
def get_product_details(product_id):
    try:
        product = Product.query.filter_by(product_id=product_id).first()
        response_data = {
            "product": 
                {
                    "id": product.id,
                    "name": product.name,
                    "price": product.price,
                    "description": product.description,
                    "image_url": product.image,
                    "stock": product.stock,
                    "manufacturer": product.manufacturer
                }
        }
    
        return jsonify(response_data), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Post a new product (Admin only)

# Update product (Admin only)

# Delete product (Admin only)