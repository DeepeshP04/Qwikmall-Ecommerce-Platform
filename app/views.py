from flask import Blueprint, render_template, request
import random

views = Blueprint("views", import_name=__name__, url_prefix="/")

@views.route("/", methods=["GET"])
def index():
    return render_template("index.html") 

@views.route("/login", methods=["GET"])
def login():
    return render_template("login.html")

@views.route("/signup", methods=["GET"])
def signup():
    return render_template("signup.html")

@views.route("/send-code", methods=["POST"])
def send_code():
    data = request.json
    contact = data.get("contactInput")
    
    code = random.randint(100000, 999999)