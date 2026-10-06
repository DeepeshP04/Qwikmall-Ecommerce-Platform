from app.models import User, Address
from app import db
from flask import jsonify
from sqlalchemy.exc import IntegrityError

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
            "role": user.role,
            "created_at": user.created_at.isoformat() if user.created_at else None
        }
        return jsonify({"success": True, "data": user_data}), 200

    @staticmethod
    def update_user_profile(user_id, data):
        user = User.query.get(user_id)
        if not user:
            return jsonify({"success": False, "message": "User does not exist"}), 404
        if not isinstance(data, dict):
            return jsonify({"success": False, "message": "A profile object is required."}), 400

        editable_fields = {"username", "email", "phone"}
        if not data or not set(data).issubset(editable_fields):
            return jsonify({"success": False, "message": "Only username, email, and phone can be updated."}), 400

        updates = {}
        for field in data:
            value = data[field]
            if field == "email" and value is None:
                updates[field] = None
                continue
            if not isinstance(value, str):
                return jsonify({"success": False, "message": f"{field} must be a string."}), 400

            value = value.strip()
            max_length = 100 if field == "username" else (100 if field == "email" else 20)
            if field in {"username", "phone"} and not value:
                return jsonify({"success": False, "message": f"{field} cannot be empty."}), 400
            if len(value) > max_length:
                return jsonify({"success": False, "message": f"{field} is too long."}), 400
            if field == "email" and value and ("@" not in value or "." not in value.rsplit("@", 1)[-1]):
                return jsonify({"success": False, "message": "Enter a valid email address."}), 400
            updates[field] = value or None if field == "email" else value

        if "phone" in updates and User.query.filter(
            User.phone == updates["phone"],
            User.id != user.id
        ).first():
            return jsonify({"success": False, "message": "That phone number is already registered."}), 409

        for field, value in updates.items():
            setattr(user, field, value)
        try:
            db.session.commit()
        except IntegrityError:
            db.session.rollback()
            return jsonify({"success": False, "message": "That phone number is already registered."}), 409
        return jsonify({"success": True, "message": "User profile updated successfully."}), 200

    @staticmethod
    def get_user_addresses(user_id):
        user = User.query.get(user_id)
        if not user:
            return jsonify({"success": False, "message": "User does not exist"}), 404

        addresses = [UserService._address_to_dict(address) for address in user.addresses]

        return jsonify({"success": True, "data": addresses}), 200

    @staticmethod
    def update_user_address(user_id, address_id, data):
        if not isinstance(data, dict):
            return jsonify({"success": False, "message": "An address object is required."}), 400

        address = Address.query.filter_by(id=address_id, user_id=user_id).first()
        if not address:
            return jsonify({"success": False, "message": "Address does not exist."}), 404

        field_limits = {
            "address_line1": 100,
            "address_line2": 100,
            "city": 50,
            "state": 50,
            "postal_code": 10,
            "country": 50,
            "landmark": 100,
        }
        editable_fields = set(field_limits) | {"is_default"}
        if not data or not set(data).issubset(editable_fields):
            return jsonify({"success": False, "message": "The address contains unsupported fields."}), 400

        updates = {}
        for field, value in data.items():
            if field == "is_default":
                if not isinstance(value, bool):
                    return jsonify({"success": False, "message": "is_default must be a boolean."}), 400
                updates[field] = value
                continue

            if value is None and field in {"address_line2", "landmark"}:
                updates[field] = None
                continue
            if not isinstance(value, str):
                return jsonify({"success": False, "message": f"{field} must be a string."}), 400

            value = value.strip()
            if field in {"address_line1", "city", "state", "postal_code", "country"} and not value:
                return jsonify({"success": False, "message": f"{field} cannot be empty."}), 400
            if len(value) > field_limits[field]:
                return jsonify({"success": False, "message": f"{field} is too long."}), 400
            updates[field] = value or None if field in {"address_line2", "landmark"} else value

        if updates.get("is_default") is True:
            Address.query.filter(
                Address.user_id == user_id,
                Address.id != address.id
            ).update({Address.is_default: False}, synchronize_session=False)

        for field, value in updates.items():
            setattr(address, field, value)

        db.session.commit()
        return jsonify({
            "success": True,
            "message": "Address updated successfully.",
            "data": UserService._address_to_dict(address)
        }), 200

    @staticmethod
    def _address_to_dict(address):
        return {
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