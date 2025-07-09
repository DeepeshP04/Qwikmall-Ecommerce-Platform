from flask import jsonify, session

def login_required(f):
    from functools import wraps
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if "user" not in session:
            return jsonify({"Success": False, "Message": "Please login."}), 401
        return f(*args, **kwargs)
    return decorated_function