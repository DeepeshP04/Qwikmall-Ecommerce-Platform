from flask import Blueprint, jsonify
from app.models import User

user_bp = Blueprint("users", __name__, url_prefix="/users")

# Get a user by id
@user_bp.route("/<int:user_id>", methods=["GET"])
def get_user(user_id):
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({"success": False, "message": "User does not exist"}), 404
    
    return jsonify({"success": True, "user": user.to_dict()}), 200