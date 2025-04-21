from flask import Blueprint, jsonify, request
from app.models import User
from app import db

user_bp = Blueprint("users", __name__, url_prefix="/users")

# Get a user by id
@user_bp.route("/<int:user_id>", methods=["GET"])
def get_user_by_id(user_id):
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({"success": False, "message": "User does not exist"}), 404
    
    return jsonify({"success": True, "user": user.to_dict()}), 200

# Update user profile by user id
@user_bp.route("/<int:user_id>", methods=["PATCH"])
def update_user_profile(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({"success": False, "message": "User does not exist"}), 404
    
    data = request.get_json()
    
    if "username" in data:
        user.username = data["username"]
        
    if "email" in data:
        email = data["email"]
        if not email.endswith("@gmail.com"):
            return jsonify({"success": False, "message": "Email is not valid."}), 400
        user.email = email
        
    if "phone" in data:
        phone = data["phone"]
        if not phone.isdigit() or len(phone) != 10:
            return jsonify({"success": False, "message": "Phone is not valid."}), 400
        
        existing_user = User.query.filter(User.phone == phone, User.id != user_id).first()
        if existing_user:
            return jsonify({"success": False, "message": "PHone number already exists."}), 409
        user.phone = phone
    
    db.session.commit()
    return jsonify({"success": True, "message": "User profile updated successfully."}), 200