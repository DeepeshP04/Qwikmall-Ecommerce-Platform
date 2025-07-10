from flask import Blueprint, request, session
from app.services.checkout_service import CheckoutService

checkout_bp = Blueprint('checkout', __name__, url_prefix='/checkout')

@checkout_bp.route('/', methods=['POST'])
def checkout():
    user = session.get('user')
    if not user:
        return CheckoutService.unauthorized_response()
    user_id = user['user_id']
    data = request.get_json()
    return CheckoutService.checkout(user_id, data)