from flask import Blueprint, jsonify, request
from app.models import User
from app import db
from app.services.user_service import UserService

user_bp = Blueprint("users", __name__, url_prefix="/users")

# Get a user's profile
@user_bp.route("/me", methods=["GET"])
def get_my_profile():
    user_id = session.get("user").get("user_id")
    user_data = UserService.get_user_details_by_id(user_id)
    if not user_data:
        return jsonify({"success": False, "message": "User does not exist"}), 404
    
    return jsonify({"success": True, "data": user_data}), 200

# Update user profile
@user_bp.route("/me", methods=["PATCH"])
def update_user_profile():
    user_id = session.get("user").get("user_id")
    user = User.query.get(user_id)
    if not user:
        return jsonify({"success": False, "message": "User does not exist"}), 404
    
    data = request.get_json()
    if "role" in data:
        data.pop("role")

    UserService.update_user_profile(user, data)
    return jsonify({"success": True, "message": "User profile updated successfully."}), 200