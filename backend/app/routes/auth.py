from flask import Blueprint, request, session
from app.services.auth_service import AuthService
from app.utils.helpers import login_required

auth_bp = Blueprint("auth", __name__, url_prefix="/auth")

# Signup
@auth_bp.route("/signup/request-otp", methods=["POST"])
def signup_request_otp():
    data = request.get_json() or {}
    username = data.get("username")
    mobile = data.get("mobile")
    return AuthService.signup_request_otp(username, mobile)

@auth_bp.route("/signup/verify-otp", methods=["POST"])
def signup_verify_otp():
    data = request.get_json() or {}
    code = data.get("code")
    return AuthService.signup_verify_otp(code)

# Login
@auth_bp.route("/login/request-otp", methods=["POST"])
def login_request_otp():
    data = request.get_json() or {}
    mobile = data.get("mobile")
    return AuthService.login_request_otp(mobile)

@auth_bp.route("/login/verify-otp", methods=["POST"])
def login_verify_otp():
    data = request.get_json() or {}
    code = data.get("code")
    return AuthService.login_verify_otp(code)

# Logout
@auth_bp.route("/logout", methods=["POST"])
@login_required
def logout():
    return AuthService.logout()