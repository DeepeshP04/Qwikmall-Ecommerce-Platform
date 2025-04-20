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
        # For each category, fetch 5 products
        for category in categories:
            category.products = category.products.limit(5).all()
    
        products = {
            "categories": [
                {
                    "id": category.id,
                    "name": category.name,
                    "description": category.description,
                    "products": [
                        {
                            "id": product.id,
                            "name": product.name,
                            "price": product.price,
                            "description": product.description,
                            "image_url": product.image,
                        }
                        for product in category.products
                    ],
                }
                for category in categories
            ]
        }
        # Return the JSON response of products
        return jsonify(products), 200
    except Exception as e:
        # Handle any exceptions that occur during the process
        return jsonify({"error": str(e)}), 500

# All products of a category
@product_bp.route("/products/category/category_id", methods=["GET"])
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
    
        return jsonify(response_data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
# List all products

# Get a product by id or get product details

# Post a new product (Admin only)

# Update product (Admin only)

# Delete product (Admin only)