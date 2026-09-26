"""AgroGuardian AI — Auth Routes"""
from flask import Blueprint, send_from_directory
from controllers.auth_controller import (
    signup, login, get_profile, refresh_token,
    update_profile, upload_avatar, get_notifications,
    google_auth, send_otp, verify_otp,
)
from utils.helpers import auth_required
import os

auth_bp = Blueprint("auth", __name__)

auth_bp.route("/signup",         methods=["POST"])(signup)
auth_bp.route("/register",       methods=["POST"])(signup)
auth_bp.route("/login",          methods=["POST"])(login)
auth_bp.route("/google",         methods=["POST"])(google_auth)
auth_bp.route("/send-otp",       methods=["POST"])(send_otp)
auth_bp.route("/verify-otp",     methods=["POST"])(verify_otp)
auth_bp.route("/profile",        methods=["GET"]) (auth_required(get_profile))
auth_bp.route("/profile",        methods=["PUT"]) (auth_required(update_profile))
auth_bp.route("/profile/avatar", methods=["PUT"]) (auth_required(upload_avatar))
auth_bp.route("/refresh",        methods=["POST"])(auth_required(refresh_token))
auth_bp.route("/notifications",  methods=["GET"]) (auth_required(get_notifications))

@auth_bp.route("/uploads/<path:filename>", methods=["GET"])
def serve_upload(filename):
    upload_dir = os.environ.get("UPLOAD_DIR", "uploads")
    return send_from_directory(os.path.abspath(upload_dir), filename)
