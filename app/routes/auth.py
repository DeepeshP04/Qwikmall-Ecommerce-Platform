from flask import Blueprint, request, jsonify
from app.models import User

auth_bp = Blueprint("auth", __name__, url_prefix="/auth")

def send_code(phone):
    # Generate a verification code
    # Store code in redis with associated phone number and set expiry time of 5 minutes
    # Send verification code to the phone number using twilio
    # If sending fails, return error message
    # If sending succeeds, return success message
    pass

def verify_code(phone, code):
    # If the code is valid and not expired
    # Verify the code entered by user and code in redis
    # If correct, delete the code from redis and return success
    # If expired or invalid, return error message
    
    pass

# signup
@auth_bp.route("/signup/send-code", methods=["POST"])
def signup_send_code():
    data = request.get_json() or {}
    phone = data.get("phone")
    username = data.get("username")
    
    if not phone or not username:
        return jsonify({"success": False, "message": "Phone and Username are required."}), 400
    
    user = User.query.filter_by(phone=phone).first()
    
    if user:
        return jsonify({"success": False, "message": "User already exists. Please login."}), 409

    send_code(phone)
    return jsonify({"success": True, "message": "Verification code sent. Please verify to signup."}), 200
        
@auth_bp.route("/signup/verify-code", methods=["POST"])
def signup_verify_code():
    data = request.get_json() or {}
    phone = data.get("phone")
    code = data.get("code")
    
    if not phone or not code:
        return jsonify({"success": False, "message": "Phone and Code are required."}), 400
    
    verify_code(phone, code)
    # If verification is successful, create a new user
    # Save in database
    # Create a session for the user
    # Return success message

# login
@auth_bp.route("/login/send-code", methods=["POST"])
def login_send_code():
    data = request.get_json() or {}
    phone = data.get("phone")
    
    if not phone:
        return jsonify({"success": False, "message": "Phone is required."}), 400
    
    user = User.query.filter_by(phone=phone).first()
    
    if not user:
        return jsonify({"success": False, "message": "User does not exist. Please signup."}), 409
    
    send_code(phone)
    return {"success": True, "message": "Verification code sent. Please verify to login."}