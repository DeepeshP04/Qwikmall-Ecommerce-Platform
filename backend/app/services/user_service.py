from app.models import User
from app import db
from flask import jsonify

class UserService:
    @staticmethod
    def get_user_details_by_id(user_id):
        user = User.query.get(user_id)
        if not user:
            return jsonify({"success": False, "message": "User does not exist"}), 404
        user_data = {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "phone": user.phone,
            "role": user.role
        }
        return jsonify({"success": True, "data": user_data}), 200

    @staticmethod
    def update_user_profile(user_id, data):
        user = User.query.get(user_id)
        if not user:
            return jsonify({"success": False, "message": "User does not exist"}), 404
        if "role" in data:
            data.pop("role")
        for key, value in data.items():
            setattr(user, key, value)
        db.session.commit()
        return jsonify({"success": True, "message": "User profile updated successfully."}), 200

        