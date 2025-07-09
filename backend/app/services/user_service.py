from app.models import User
from app import db

class UserService:
    @staticmethod
    def get_user_details_by_id(user_id):
        user = User.query.get(user_id)
        if not user:
            return None
        
        address = Address.query.filter_by(user_id=user_id).first()
        address_data = {
            "id": address.id,
            "address_line_1": address.address_line_1,
            "address_line_2": address.address_line_2 if address.address_line_2 else None,
            "city": address.city,
            "state": address.state,
            "country": address.country,
            "pincode": address.pincode,
        }

        return {
            "id": user.id,
            "username": user.username,
            "email": user.email if user.email else None,
            "phone": user.phone,
            "address": address_data,
        }

    @staticmethod
    def update_user_profile(user, data):
        for field in ["username", "email", "phone"]:
            if field in data:
                setattr(user, field, data[field])

        db.session.commit()

        return True

        