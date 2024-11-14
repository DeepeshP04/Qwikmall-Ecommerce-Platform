from flask import Blueprint, render_template

views = Blueprint("views", import_name=__name__, url_prefix="/")

@views.route("/")
def index():
    return render_template("base.html") 