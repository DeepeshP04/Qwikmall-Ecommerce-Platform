from flask import Blueprint, request, jsonify, session
from app.models import User
from app import db
from twilio.rest import Client
import random
import os
from dotenv import load_dotenv
from app.redis_client import redis_client

load_dotenv()

account_sid = os.getenv("TWILIO_ACCOUNT_SID")
auth_token = os.getenv("TWILIO_AUTH_TOKEN")
phone_number = os.getenv("TWILIO_PHONE_NUMBER")

auth_bp = Blueprint("auth", __name__, url_prefix="/auth")

def get_user_by_phone(phone):
    # Query the database to find a user with the given phone number
    return User.query.filter_by(phone=phone).first()

def send_code(phone):
    # Create twilio client using account_sid and auth_token
    client = Client(account_sid, auth_token)
    
    # Generate a verification code
    code = random.randint(100000, 999999)
    
    # Store code in redis with associated phone number and set expiry time of 5 minutes
    redis_client.set(phone, code, 300)
    
    # Send verification code to the phone number using twilio
    # If sending succeeds, return success message
    try:
        message = client.messages.create(
            body=f"Your verification code is {code}",
            from_=phone_number,
            to=phone
        )
        return True
    
    # If sending fails, return False
    except:
        return False

def verify_code(phone, code):
    # If the code is valid and not expired
    stored_code = redis_client.get(phone)
    if not stored_code:
        return False

    # Verify the code entered by user and code in redis
    if str(code) != stored_code.decode("utf-8"):
        return False
    
    # Delete the code from redis after successful verification
    redis_client.delete(phone)
    return True

# signup
@auth_bp.route("/signup/send-code", methods=["POST"])
def signup_send_code():
    # Get the phone number and username from the request data
    data = request.get_json() or {}
    phone = data.get("phone")
    username = data.get("username")
    
    # Check if phone number and username are provided
    # If not, return error message
    if not phone or not username:
        return jsonify({"success": False, "message": "Phone and Username are required."}), 400
    
    # Get the user from the database using the phone number
    # If user exists, return user exists message
    user = get_user_by_phone(phone)
    if user:
        return jsonify({"success": False, "message": "User already exists. Please login."}), 409
    
    # Store the phone number and username in the session
    # This is used to create a new user after the code is verified
    session["pending_signup"] = {"phone": phone, "username": username}

    if not send_code(phone):
        return jsonify({"success": False, "message": "Failed to send verification code. Please try again later."}), 500
    
    return jsonify({"success": True, "message": "Verification code sent. Code is valid for 5 minutes."}), 200
        
@auth_bp.route("/signup/verify-code", methods=["POST"])
def signup_verify_code():
    data = request.get_json() or {}
    phone = data.get("phone")
    code = data.get("code")
    
    if not phone or not code:
        return jsonify({"success": False, "message": "Phone and Code are required."}), 400
    
    if not verify_code(phone, code):
        return jsonify({"success": False, "message": "Invalid or expired code. Please try again."}), 400
    
    pending = session.get("pending_signup")
    if not pending or pending["phone"] != phone:
        return jsonify({"success": False, "message": "Invalid session. Please try again."}), 400
    
    # If verification is successful, Create a new user in the database
    new_user = User(
        phone=pending["phone"],
        username=pending["username"]
    )
    db.session.add(new_user)
    db.session.commit()
    
    # Remove the pending signup data from the session
    session.pop("pending_signup", None)
    
    # Create a session for the user
    session["user"] = {"user_id": new_user.id, "username": new_user.username, "logged_in": True}
    
    # Return success message
    return jsonify({"success": True, "message": "Signed up successfully."}), 200

# login
@auth_bp.route("/login/send-code", methods=["POST"])
def login_send_code():
    data = request.get_json() or {}
    phone = data.get("phone")
    
    if not phone:
        return jsonify({"success": False, "message": "Phone is required."}), 400
    
    user = get_user_by_phone(phone)
    if not user:
        return jsonify({"success": False, "message": "User does not exist. Please signup."}), 409
    
    if not send_code(phone):
        return jsonify({"success": False, "message": "Failed to send verification code. Please try again later."}), 500
    
    return {"success": True, "message": "Verification code sent. Code is valid for 5 minutes."}, 200

@auth_bp.route("/logout", methods=["POST"])
def logout():
    # Clear the session and return success message
    pass