from flask import Blueprint, request, session
from app.models import User
from app import db
from app.services.user_service import UserService
from app.utils.helpers import login_required

user_bp = Blueprint("users", __name__, url_prefix="/users")

# Get a user's profile
@user_bp.route("/me", methods=["GET"])
@login_required
def get_my_profile():
    user_id = session.get("user").get("user_id")
    return UserService.get_user_details_by_id(user_id)

# Update user profile
@user_bp.route("/me", methods=["PATCH"])
@login_required
def update_user_profile():
    user_id = session.get("user").get("user_id")
    user = User.query.get(user_id)
    data = request.get_json()
    if "role" in data:
        data.pop("role")
    return UserService.update_user_profile(user, data)