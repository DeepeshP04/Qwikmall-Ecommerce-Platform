from flask import Blueprint, request, jsonify, session
from app.services.auth_service import AuthService

auth_bp = Blueprint("auth", __name__, url_prefix="/auth")
auth_service = AuthService()

# Signup
@auth_bp.route("/signup/send-code", methods=["POST"])
def signup_send_code():
    data = request.get_json() or {}
    phone = data.get("phone")
    username = data.get("username")
    
    # Check if phone number and username are provided
    if not phone or not username:
        return jsonify({"success": False, "message": "Phone and Username are required."}), 400
    
    # Check if user already exists
    user = auth_service.get_user_by_phone(phone)
    if user:
        return jsonify({"success": False, "message": "User already exists. Please login."}), 409
    
    # Send verification code
    if not auth_service.send_verification_code(phone):
        return jsonify({"success": False, "message": "Failed to send verification code. Please try again later."}), 500

    # Store the phone number and username in the session
    session["pending_signup"] = {"phone": phone, "username": username}
    
    return jsonify({"success": True, "message": "Verification code sent. Code is valid for 5 minutes."}), 200
        
@auth_bp.route("/signup/verify-code", methods=["POST"])
def signup_verify_code():
    data = request.get_json() or {}
    code = data.get("code")
    
    if not code:
        return jsonify({"success": False, "message": "Code is required."}), 400
    
    pending = session.get("pending_signup")
    phone = pending.get("phone")
    
    if not auth_service.verify_code(phone, code):
        return jsonify({"success": False, "message": "Invalid or expired code. Please try again."}), 400
    
    # Create new user
    new_user = auth_service.create_user(phone, pending["username"])
    
    # Remove the pending signup data from the session
    session.pop("pending_signup", None)
    
    # Create a session for the user
    auth_service.login_user(new_user)
    
    return jsonify({"success": True, "message": "Signed up successfully."}), 200

# Login
@auth_bp.route("/login/send-code", methods=["POST"])
def login_send_code():
    data = request.get_json() or {}
    phone = data.get("phone")
    
    if not phone:
        return jsonify({"success": False, "message": "Phone is required."}), 400
    
    user = auth_service.get_user_by_phone(phone)
    if not user:
        return jsonify({"success": False, "message": "User does not exist. Please signup."}), 409
    
    if not auth_service.send_verification_code(phone):
        return jsonify({"success": False, "message": "Failed to send verification code. Please try again later."}), 500
    
    session["pending_login"] = {"phone": phone}
    
    return {"success": True, "message": "Verification code sent. Code is valid for 5 minutes."}, 200

@auth_bp.route("/login/verify-code", methods=["POST"])
def login_verify_code():
    data = request.get_json() or {}
    code = data.get("code")
    
    if not code:
        return jsonify({"success": False, "message": "Code is required."}), 400
    
    pending = session.get("pending_login")
    phone = pending.get("phone")
    
    if not auth_service.verify_code(phone, code):
        return jsonify({"success": False, "message": "Invalid or expired code. Please try again."}), 400
    
    session.pop("pending_login", None)
    
    # Create a session for the user
    user = auth_service.get_user_by_phone(phone)
    auth_service.login_user(user)
    
    return jsonify({"success": True, "message": "Logged in successfully."}), 200

# Logout
@auth_bp.route("/logout", methods=["POST"])
def logout():
    auth_service.logout_user()
    return jsonify({"success": True, "message": "Logged out successfully."}), 200