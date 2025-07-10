from flask import jsonify, session
from app.models import User
from app import db
from twilio.rest import Client
import random
import os
from dotenv import load_dotenv
from app.redis_client import redis_client

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
    def get_current_user():
        """Get current logged in user"""
        user_data = session.get("user")
        if user_data and user_data.get("logged_in"):
            return User.query.get(user_data["user_id"])
        return None
    
    @staticmethod
    def is_user_logged_in():
        """Check if user is logged in"""
        user_data = session.get("user")
        return user_data and user_data.get("logged_in") 

    @staticmethod
    def signup_request_otp(username, mobile):
        if not username or not mobile:
            return jsonify({
                "success": False,
                "message": "Username and mobile are required."
            }), 400
        user = AuthService.get_user_by_mobile(mobile)
        if user:
            return jsonify({
                "success": False,
                "message": "Mobile number already registered. Try logging in."
            }), 409
        if not AuthService.send_otp(mobile):
            return jsonify({
                "success": False,
                "message": "Failed to send OTP. Please try again later."
            }), 500
        session["pending_signup"] = {"mobile": mobile, "username": username}
        return jsonify({
            "success": True,
            "message": "OTP sent successfully. Please verify to sign up"
        }), 200

    @staticmethod
    def signup_verify_otp(code):
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
        if not AuthService.verify_otp(mobile, code):
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
        if not mobile:
            return jsonify({
                "success": False,
                "message": "Mobile number is required."
            }), 400
        user = AuthService.get_user_by_mobile(mobile)
        if not user:
            return jsonify({
                "success": False,
                "message": "Mobile number not registered. Please sign up."
            }), 404
        if not AuthService.send_otp(mobile):
            return jsonify({
                "success": False,
                "message": "Failed to send OTP. Please try again later."
            }), 500
        session["pending_login"] = {"mobile": mobile}
        return jsonify({
            "success": True,
            "message": "OTP sent successfully. Please verify to login"
        }), 200

    @staticmethod
    def login_verify_otp(code):
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
        if not AuthService.verify_otp(mobile, code):
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
        if not AuthService.is_user_logged_in():
            return jsonify({
                "success": False,
                "message": "No user logged in."
            }), 401
        AuthService.logout_user()
        return jsonify({
            "success": True,
            "message": "Logged out successfully."
        }), 200 