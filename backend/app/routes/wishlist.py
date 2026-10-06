from flask import Blueprint, request, session

from app.services.wishlist_service import WishlistService
from app.utils.helpers import login_required

wishlist_bp = Blueprint("wishlist", __name__, url_prefix="/wishlist")


@wishlist_bp.route("", methods=["GET"], strict_slashes=False)
@login_required
def get_my_wishlist():
    user_id = session["user"]["user_id"]
    return WishlistService.get_user_wishlist(user_id)


@wishlist_bp.route("/items", methods=["POST"], strict_slashes=False)
@login_required
def add_wishlist_item():
    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        return {"success": False, "message": "A product object is required."}, 400
    user_id = session["user"]["user_id"]
    return WishlistService.add_item(user_id, data.get("product_id"))


@wishlist_bp.route("/items/<int:item_id>", methods=["DELETE"], strict_slashes=False)
@login_required
def remove_wishlist_item(item_id):
    user_id = session["user"]["user_id"]
    return WishlistService.remove_item(user_id, item_id)
