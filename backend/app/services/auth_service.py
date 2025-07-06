from flask import session
from app.models import User
from app import db
from twilio.rest import Client
import random
import os
from dotenv import load_dotenv
from app.redis_client import redis_client

load_dotenv()

class AuthService:
    def __init__(self):
        self.account_sid = os.getenv("TWILIO_ACCOUNT_SID")
        self.auth_token = os.getenv("TWILIO_AUTH_TOKEN")
        self.phone_number = os.getenv("TWILIO_PHONE_NUMBER")
    
    def get_user_by_phone(self, phone):
        """Get user by phone number"""
        return User.query.filter_by(phone=phone).first()
    
    def send_verification_code(self, phone):
        """Send verification code via SMS"""
        client = Client(self.account_sid, self.auth_token)
        
        # Generate a verification code
        code = random.randint(100000, 999999)
        
        # Store code in redis with 5 minutes expiry
        redis_client.set(phone, code, 300)
        
        try:
            message = client.messages.create(
                body=f"Your verification code is {code}",
                from_=self.phone_number,
                to=phone
            )
            return True
        except Exception as e:
            print(f"Error sending SMS: {e}")
            return False
    
    def verify_code(self, phone, code):
        """Verify the code entered by user"""
        stored_code = redis_client.get(phone)
        if not stored_code:
            return False
        
        if str(code) != stored_code.decode("utf-8"):
            return False
        
        # Delete the code from redis after successful verification
        redis_client.delete(phone)
        return True
    
    def create_user(self, phone, username):
        """Create a new user"""
        new_user = User(
            phone=phone,
            username=username
        )
        db.session.add(new_user)
        db.session.commit()
        return new_user
    
    def login_user(self, user):
        """Create session for logged in user"""
        session["user"] = {
            "user_id": user.id, 
            "username": user.username, 
            "logged_in": True
        }
    
    def logout_user(self):
        """Clear user session"""
        session.pop("user", None)
    
    def get_current_user(self):
        """Get current logged in user"""
        user_data = session.get("user")
        if user_data and user_data.get("logged_in"):
            return User.query.get(user_data["user_id"])
        return None 