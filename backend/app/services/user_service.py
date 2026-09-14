from app.models import User, Address
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

    @staticmethod
    def get_user_addresses(user_id):
        user = User.query.get(user_id)
        if not user:
            return jsonify({"success": False, "message": "User does not exist"}), 404

        addresses = [
            {
                "id": address.id,
                "address_line1": address.address_line1,
                "address_line2": address.address_line2,
                "city": address.city,
                "state": address.state,
                "postal_code": address.postal_code,
                "country": address.country,
                "is_default": address.is_default,
                "landmark": address.landmark,
            }
            for address in user.addresses
        ]

        return jsonify({"success": True, "data": addresses}), 200

        