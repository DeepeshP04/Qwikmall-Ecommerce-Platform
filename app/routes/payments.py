from flask import Blueprint

payment_bp = Blueprint("payments", __name__, url_prefix="/payments")