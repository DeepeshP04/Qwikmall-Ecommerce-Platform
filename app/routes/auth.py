from flask import Blueprint

auth_bp = Blueprint("auth", __name__, url_prefix="/auth")

# signup
@auth_bp.route("/signup/send-code", methods=["POST"])
def send_code(phone, username):
    from app.models import User
    if phone and username:
        user = User.query.filter_by(phone=phone).first()
        if user:
            return {"success": False, "message": "User already exist. Please login."}
        elif not user:
            # Generate a verification code
            # Store code in redis with associated phone number and set expiry time of 5 minutes
            # Send verification code to the phone number using twilio
            return {"success": True, "message": "Verification code sent. Please verify to signup."}
        
# login
@auth_bp.route("/login/send-code", methods=["POST"])
def send_code(phone):
    from app.models import User
    if phone:
        user = User.query.filter_by(phone=phone).first()
        if user:
            # Generate a verification code
            # Store code in redis with associated phone number and set expiry time of 5 minutes
            # Send verification code to the phone number using twilio
            return {"success": True, "message": "Verification code sent. Please verify to login."}
        elif not user:
            return {"success": False, "message": "User does not exist. Please signup."}