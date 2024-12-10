from flask import Blueprint, render_template, request, jsonify, session
import random
import os
from dotenv import load_dotenv
from twilio.rest import Client

views = Blueprint("views", import_name=__name__, url_prefix="/")

load_dotenv()

account_sid = os.getenv("TWILIO_ACCOUNT_SID")
auth_token = os.getenv("TWILIO_AUTH_TOKEN")
phone_number = os.getenv("TWILIO_PHONE_NUMBER")

# list to store verification codes
verification_codes = []

# later create dict to
# store verification codes with mobile number as key

@views.route("/", methods=["GET"])
def index():
    from .models import Product
    
    logged_in = session.get("logged_in", False)
    products = Product.query.limit(5).all()
    return render_template("index.html", logged_in=logged_in, products=products) 

@views.route("/login", methods=["GET"])
def login():
    return render_template("login.html")

@views.route("/signup", methods=["GET"])
def signup():
    return render_template("signup.html")

@views.route("/send-code", methods=["POST"])
def send_code():
    client = Client(account_sid, auth_token)
    
    data = request.json
    # print(data)
    contact = data.get("contactInput")
    
    code = random.randint(100000, 999999)
    verification_codes.append(code)
    
    try:
        message = client.messages.create(
            body=f"Your verification code is {code}",
            from_=phone_number,
            to=contact
        ) 
        print("Sent code")
        return jsonify({"success": True}), 200
    
    except Exception as e:
        return jsonify({"success": False, "error": str(e)})
    
@views.route("/verify-code", methods=["POST"])
def verify_code():
    data = request.json
    verification_code = data.get("verificationCode")
    # print(verification_code)
    # print(verification_codes[0])
    
    if verification_code == str(verification_codes[0]):
        print("success")
        session["logged_in"] = True
        return jsonify({"success": True})
    else:
        return jsonify({"success": False, "error": "Invalid code"})
    
@views.route("/categories-more-products")
def categories_more_products():
    from .models import Product
    
    products = Product.query.all()
    return render_template("categories-more-products.html", products=products)    