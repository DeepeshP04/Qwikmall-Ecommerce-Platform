from flask import Blueprint, render_template

views = Blueprint("views", import_name=__name__, url_prefix="/")

@views.route("/")
def index():
    return render_template("index.html") 

@views.route("/login")
def login():
    return render_template("login.html")

@views.route("/signup")
def signup():
    return render_template("signup.html")