from flask import Blueprint, request, session
from app.services.checkout_service import CheckoutService
from app.utils.helpers import login_required

checkout_bp = Blueprint('checkout', __name__, url_prefix='/checkout')

@checkout_bp.route('/', methods=['POST'])
@login_required
def checkout():
    user_id = session.get('user').get('user_id')
    data = request.get_json()
    return CheckoutService.checkout(user_id, data)