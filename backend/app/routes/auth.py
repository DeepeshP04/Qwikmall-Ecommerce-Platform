from flask import Blueprint, request, jsonify, session
from app.services.auth_service import AuthService

auth_bp = Blueprint("auth", __name__, url_prefix="/auth")
auth_service = AuthService()

# Signup
@auth_bp.route("/signup/request-otp", methods=["POST"])
def signup_request_otp():
    data = request.get_json() or {}
    username = data.get("username")
    mobile = data.get("mobile")
    
    # Check if username and mobile are provided
    if not username or not mobile:
        return jsonify({
            "success": False, 
            "message": "Username and mobile are required."
        }), 400
    
    # Check if user already exists
    user = auth_service.get_user_by_mobile(mobile)
    if user:
        return jsonify({
            "success": False, 
            "message": "Mobile number already registered. Try logging in."
        }), 409
    
    # Send OTP
    if not auth_service.send_otp(mobile):
        return jsonify({
            "success": False, 
            "message": "Failed to send OTP. Please try again later."
        }), 500

    # Store the mobile and username in the session
    session["pending_signup"] = {"mobile": mobile, "username": username}
    
    return jsonify({
        "success": True, 
        "message": "OTP sent successfully. Please verify to sign up"
    }), 200
        
@auth_bp.route("/signup/verify-otp", methods=["POST"])
def signup_verify_otp():
    data = request.get_json() or {}
    code = data.get("code")
    
    # Check if code is provided
    if not code:
        return jsonify({
            "success": False, 
            "message": "OTP Code is required."
        }), 400
    
    pending = session.get("pending_signup")
    if not pending:
        return jsonify({
            "success": False, 
            "message": "No pending signup found. Please request OTP again."
        }), 400
    
    mobile = pending.get("mobile")
    
    # Verify OTP
    if not auth_service.verify_otp(mobile, code):
        return jsonify({
            "success": False, 
            "message": "Invalid or expired OTP"
        }), 422
    
    # Create new user
    new_user = auth_service.create_user(mobile, pending["username"])
    
    # Remove the pending signup data from the session
    session.pop("pending_signup", None)
    
    # Create a session for the user
    auth_service.login_user(new_user)
    
    return jsonify({
        "success": True, 
        "message": "User signed up successfully."
    }), 201

# Login
@auth_bp.route("/login/request-otp", methods=["POST"])
def login_request_otp():
    data = request.get_json() or {}
    mobile = data.get("mobile")
    
    # Check if mobile is provided
    if not mobile:
        return jsonify({
            "success": False, 
            "message": "Mobile number is required."
        }), 400
    
    # Check if user exists
    user = auth_service.get_user_by_mobile(mobile)
    if not user:
        return jsonify({
            "success": False, 
            "message": "Mobile number not registered. Please sign up."
        }), 404
    
    # Send OTP
    if not auth_service.send_otp(mobile):
        return jsonify({
            "success": False, 
            "message": "Failed to send OTP. Please try again later."
        }), 500
    
    # Store mobile in session as pending_login
    session["pending_login"] = {"mobile": mobile}
    
    return jsonify({
        "success": True, 
        "message": "OTP sent successfully. Please verify to login"
    }), 200

@auth_bp.route("/login/verify-otp", methods=["POST"])
def login_verify_otp():
    data = request.get_json() or {}
    code = data.get("code")
    
    # Check if code is provided
    if not code:
        return jsonify({
            "success": False, 
            "message": "OTP code is required."
        }), 400
    
    pending = session.get("pending_login")
    if not pending:
        return jsonify({
            "success": False, 
            "message": "No pending login found. Please request OTP again."
        }), 400
    
    mobile = pending.get("mobile")
    
    # Verify OTP
    if not auth_service.verify_otp(mobile, code):
        return jsonify({
            "success": False, 
            "message": "Invalid or expired otp"
        }), 422
    
    # Remove pending_login from session
    session.pop("pending_login", None)
    
    # Get user and create session
    user = auth_service.get_user_by_mobile(mobile)
    auth_service.login_user(user)
    
    return jsonify({
        "success": True, 
        "message": "Logged in successfully."
    }), 200

# Logout
@auth_bp.route("/logout", methods=["POST"])
def logout():
    # Check if user is logged in
    if not auth_service.is_user_logged_in():
        return jsonify({
            "success": False, 
            "message": "No user logged in."
        }), 401
    
    auth_service.logout_user()
    return jsonify({
        "success": True, 
        "message": "Logged out successfully."
    }), 200