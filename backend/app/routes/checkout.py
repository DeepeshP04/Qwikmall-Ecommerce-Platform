from flask import Blueprint

checkout_bp = Blueprint('checkout', __name__, url_prefix='/checkout')

@checkout_bp.route('/', methods=['POST'])
def checkout():
    user = session.get('user')
    if not user:
        return jsonify({'success': False, 'message': 'User not logged in'}), 401
    user_id = user['user_id']
    data = request.get_json()
    response, status = CheckoutService.checkout(user_id, data)
    return jsonify(response), status