from flask import jsonify, session
from app.models import User
from app import db
from twilio.rest import Client
import random
import os
from dotenv import load_dotenv
from app.redis_client import redis_client
from app.schemas.auth import SignupRequestOTPSchema, SignupVerifyOTPSchema, LoginRequestOTPSchema, LoginVerifyOTPSchema
from marshmallow import ValidationError

load_dotenv()

class AuthService:
    account_sid = os.getenv("TWILIO_ACCOUNT_SID")
    auth_token = os.getenv("TWILIO_AUTH_TOKEN")
    phone_number = os.getenv("TWILIO_PHONE_NUMBER")
    
    @staticmethod
    def get_user_by_mobile(mobile):
        """Get user by mobile number"""
        return User.query.filter_by(phone=mobile).first()
    
    @staticmethod
    def send_otp(mobile):
        """Send OTP via SMS"""
        client = Client(AuthService.account_sid, AuthService.auth_token)
        
        # Generate a verification code
        code = random.randint(100000, 999999)
        
        # Store code in redis with 5 minutes expiry
        redis_client.set(mobile, code, 300)
        
        try:
            message = client.messages.create(
                body=f"Your verification code is {code}",
                from_=AuthService.phone_number,
                to=mobile
            )
            return True
        except Exception as e:
            print(f"Error sending SMS: {e}")
            return False
    
    @staticmethod
    def verify_otp(mobile, code):
        """Verify the OTP entered by user"""
        stored_code = redis_client.get(mobile)
        if not stored_code:
            return False
        
        if str(code) != stored_code.decode("utf-8"):
            return False
        
        # Delete the code from redis after successful verification
        redis_client.delete(mobile)
        return True
    
    @staticmethod
    def create_user(mobile, username):
        """Create a new user"""
        new_user = User(
            phone=mobile,
            username=username
        )
        db.session.add(new_user)
        db.session.commit()
        return new_user
    
    @staticmethod
    def login_user(user):
        """Create session for logged in user"""
        session["user"] = {
            "user_id": user.id, 
            "username": user.username,
            "role": user.role,
            "logged_in": True
        }
    
    @staticmethod
    def logout_user():
        """Clear user session"""
        session.pop("user", None)

    @staticmethod
    def signup_request_otp(username, mobile):
        try:
            validated_data = SignupRequestOTPSchema().load({"username": username, "mobile": mobile})
        except ValidationError as e:
            return jsonify({
                "success": False,
                "message": e.messages
            }), 400
        user = AuthService.get_user_by_mobile(validated_data["mobile"])
        if user:
            return jsonify({
                "success": False,
                "message": "Mobile number already registered. Try logging in."
            }), 409
        if not AuthService.send_otp(validated_data["mobile"]):
            return jsonify({
                "success": False,
                "message": "Failed to send OTP. Please try again later."
            }), 500
        session["pending_signup"] = {"mobile": validated_data["mobile"], "username": validated_data["username"]}
        return jsonify({
            "success": True,
            "message": "OTP sent successfully. Please verify to sign up"
        }), 200

    @staticmethod
    def signup_verify_otp(code):
        try:
            validated_data = SignupVerifyOTPSchema().load({"code": code})
        except ValidationError as e:
            return jsonify({
                "success": False,
                "message": e.messages
            }), 400
        pending = session.get("pending_signup")
        if not pending:
            return jsonify({
                "success": False,
                "message": "No pending signup found. Please request OTP again."
            }), 400
        mobile = pending.get("mobile")
        if not AuthService.verify_otp(mobile, validated_data["code"]):
            return jsonify({
                "success": False,
                "message": "Invalid or expired OTP"
            }), 422
        new_user = AuthService.create_user(mobile, pending["username"])
        session.pop("pending_signup", None)
        AuthService.login_user(new_user)
        return jsonify({
            "success": True,
            "message": "User signed up successfully."
        }), 201

    @staticmethod
    def login_request_otp(mobile):
        try:
            validated_data = LoginRequestOTPSchema().load({"mobile": mobile})
        except ValidationError as e:
            return jsonify({
                "success": False,
                "message": e.messages
            }), 400
        user = AuthService.get_user_by_mobile(mobile)
        if not user:
            return jsonify({
                "success": False,
                "message": "Mobile number not registered. Please sign up."
            }), 404
        if not AuthService.send_otp(validated_data["mobile"]):
            return jsonify({
                "success": False,
                "message": "Failed to send OTP. Please try again later."
            }), 500
        session["pending_login"] = {"mobile": validated_data["mobile"]}
        return jsonify({
            "success": True,
            "message": "OTP sent successfully. Please verify to login"
        }), 200

    @staticmethod
    def login_verify_otp(code):
        try:
            validated_data = LoginVerifyOTPSchema().load({"code": code})
        except ValidationError as e:
            return jsonify({
                "success": False,
                "message": e.messages
            }), 400
        pending = session.get("pending_login")
        if not pending:
            return jsonify({
                "success": False,
                "message": "No pending login found. Please request OTP again."
            }), 400
        mobile = pending.get("mobile")
        if not AuthService.verify_otp(mobile, validated_data["code"]):
            return jsonify({
                "success": False,
                "message": "Invalid or expired otp"
            }), 422
        session.pop("pending_login", None)
        user = AuthService.get_user_by_mobile(mobile)
        AuthService.login_user(user)
        return jsonify({
            "success": True,
            "message": "Logged in successfully."
        }), 200

    @staticmethod
    def logout():
        AuthService.logout_user()
        response = jsonify({
            "success": True,
            "message": "Logged out successfully."
        })
        response.set_cookie('session', '', expires=0)
        return response, 200