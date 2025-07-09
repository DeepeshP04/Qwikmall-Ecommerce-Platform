from flask import jsonify, session
from functools import wraps

def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if "user" not in session:
            return jsonify({"Success": False, "Message": "Please login."}), 401
        return f(*args, **kwargs)
    return decorated_function

# Admin check decorator

def admin_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        user = session.get("user")
        if not user or user.get("role") != "admin":
            return jsonify({"Success": False, "Message": "Admin access required."}), 403
        return f(*args, **kwargs)
    return decorated_function