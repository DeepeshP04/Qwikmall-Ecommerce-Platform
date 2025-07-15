from app.models import Product, Category, ProductImage, Review, ProductAttribute, ProductAttributeValue
from app import db
from sqlalchemy import or_, func
from sqlalchemy.orm import joinedload
from flask import jsonify

class ProductService:
    @staticmethod
    def get_recommended_products():
        """Get 5 products from each category for home page"""
        try:
            categories = Category.query.all()
            recommended_data = []
            
            for category in categories:
                # Get 5 products from each category
                products = Product.query.filter_by(category_id=category.id).limit(5).all()
                
                category_products = []
                for product in products:
                    # Get primary image
                    primary_image = ProductImage.query.filter_by(
                        product_id=product.id, 
                        is_primary=True
                    ).first()
                    
                    # Calculate overall rating
                    overall_rating = ProductService.calculate_overall_rating(product.id)
                    
                    product_data = {
                        "id": product.id,
                        "name": product.name,
                        "price": float(product.price),
                        "img_url": primary_image.image_url if primary_image else None,
                        "img_alt_text": primary_image.alt_text if primary_image else None,
                        "overall_rating": overall_rating
                    }
                    category_products.append(product_data)
                
                category_data = {
                    "category_id": category.id,
                    "name": category.name,
                    "products": category_products
                }
                recommended_data.append(category_data)
            
            return jsonify({"success": True, "data": recommended_data}), 200
        except Exception as e:
            print(f"Error getting recommended products: {e}")
            return jsonify({"success": False, "message": "Something went wrong. Please try again later."}), 500
    
    @staticmethod
    def get_products_by_category(category_name):
        """Get all products of a specific category"""
        try:
            category = Category.query.filter_by(name=category_name).first()
            if not category:
                return jsonify({"success": False, "message": "Category does not exist"}), 404
            
            products = Product.query.filter_by(category_id=category.id).all()
            
            products_data = []
            for product in products:
                # Get primary image
                primary_image = ProductImage.query.filter_by(
                    product_id=product.id, 
                    is_primary=True
                ).first()
                
                # Calculate overall rating
                overall_rating = ProductService.calculate_overall_rating(product.id)
                
                product_data = {
                    "id": product.id,
                    "name": product.name,
                    "price": float(product.price),
                    "img_url": primary_image.image_url if primary_image else None,
                    "img_alt_text": primary_image.alt_text if primary_image else None,
                    "overall_rating": overall_rating
                }
                products_data.append(product_data)
            
            response_data = {
                "category_id": category.id,
                "category_name": category.name,
                "products": products_data
            }
            
            return jsonify({"success": True, "data": response_data}), 200
        except Exception as e:
            print(f"Error getting products by category: {e}")
            return jsonify({"success": False, "message": "Something went wrong. Please try again later."}), 500
    
    @staticmethod
    def get_all_products(search_query=None):
        """Get all products with optional search"""
        try:
            query = Product.query
            
            if search_query:
                query = query.filter(
                    or_(
                        Product.name.ilike(f'%{search_query}%'),
                        Product.description.ilike(f'%{search_query}%'),
                        Product.manufacturer.ilike(f'%{search_query}%')
                    )
                )
            
            products = query.all()
            
            products_data = []
            for product in products:
                # Get primary image
                primary_image = ProductImage.query.filter_by(
                    product_id=product.id, 
                    is_primary=True
                ).first()
                
                # Calculate overall rating
                overall_rating = ProductService.calculate_overall_rating(product.id)
                
                product_data = {
                    "id": product.id,
                    "name": product.name,
                    "price": float(product.price),
                    "img_url": primary_image.image_url if primary_image else None,
                    "img_alt_text": primary_image.alt_text if primary_image else None,
                    "overall_rating": overall_rating
                }
                products_data.append(product_data)
            
            return jsonify({"success": True, "data": products_data}), 200
        except Exception as e:
            print(f"Error getting all products: {e}")
            return jsonify({"success": False, "message": "Something went wrong. Please try again later."}), 500
    
    @staticmethod
    def get_product_by_id(product_id):
        """Get specific product details"""
        try:
            product = Product.query.get(product_id)
            if not product:
                return jsonify({"success": False, "message": "Product does not exist"}), 404
            
            # Get all images
            images = ProductImage.query.filter_by(product_id=product_id).all()
            img_urls = [img.image_url for img in images]
            
            # Get attributes
            attributes = (db.session.query(ProductAttribute.name, ProductAttributeValue.value).join(ProductAttribute, ProductAttributeValue.attribute_id == ProductAttribute.id).filter(ProductAttributeValue.product_id == product_id).all())
            attributes_data = {}
            for attr in attributes:
                attributes_data[attr.name] = attr.value
            
            # Get reviews
            reviews = Review.query.filter_by(product_id=product_id).all()
            reviews_data = []
            for review in reviews:
                review_data = {
                    "id": review.id,
                    "rating": review.rating,
                    "text": review.comment,
                    "username": review.user.username if review.user else "Anonymous"
                }
                reviews_data.append(review_data)
            
            # Calculate overall rating
            overall_rating = ProductService.calculate_overall_rating(product_id)
            
            product_data = {
                "id": product.id,
                "name": product.name,
                "description": product.description,
                "price": float(product.price),
                "manufacturer": product.manufacturer,
                "overall_rating": overall_rating,
                "img_url": img_urls,
                "attributes": attributes_data,
                "reviews": reviews_data
            }
            
            return jsonify({"success": True, "data": product_data}), 200
        except Exception as e:
            print(f"Error getting product by id: {e}")
            return jsonify({"success": False, "message": "Something went wrong. Please try again later."}), 500
    
    @staticmethod
    def get_category_filters(category_name=None):
        """Get filter options for products"""
        try:
            if not category_name:
                return jsonify({"success": False, "message": "Category name is required"}), 400
            # Get products in specific category
            category = Category.query.filter_by(name=category_name).first()
            if not category:
                return jsonify({"success": False, "message": "Category does not exist"}), 404
                
            product_ids = [p.id for p in Product.query.filter_by(category_id=category.id).all()]
            attr_values = (
                db.session.query(ProductAttribute.name, ProductAttributeValue.value)
                .join(ProductAttribute, ProductAttributeValue.attribute_id == ProductAttribute.id)
                .filter(ProductAttributeValue.product_id.in_(product_ids))
                .all()
            )
            
            filters = {}
            for attr_name, value in attr_values:
                filters.setdefault(attr_name, set()).add(value)
            
            filters = {k: list(v) for k, v in filters.items()}
            return jsonify({"success": True, "data": filters}), 200
        except Exception as e:
            print(f"Error getting filters: {e}")
            return jsonify({"success": False, "message": "Unable to load filter options. Please try again later."}), 500

    @staticmethod
    def get_all_filters():
        """Get filter options for all products"""
        try:
            attr_values = (
                db.session.query(ProductAttribute.name, ProductAttributeValue.value)
                .join(ProductAttribute, ProductAttributeValue.attribute_id == ProductAttribute.id)
                .all()
            )
            filters = {}
            for attr_name, value in attr_values:
                filters.setdefault(attr_name, set()).add(value)
            
            filters = {k: list(v) for k, v in filters.items()}
            return jsonify({"success": True, "data": filters}), 200
        except Exception as e:
            print(f"Error getting all filters: {e}")
            return jsonify({"success": False, "message": "Unable to load filter options. Please try again later."}), 500

    @staticmethod
    def calculate_overall_rating(product_id):
        """Calculate overall rating for a product"""
        try:
            reviews = Review.query.filter_by(product_id=product_id).all()
            if not reviews:
                return 0.0
            
            total_rating = sum(review.rating for review in reviews)
            average_rating = total_rating / len(reviews)
            return round(average_rating, 1)
        except Exception as e:
            print(f"Error calculating rating: {e}")
            return 0.0 