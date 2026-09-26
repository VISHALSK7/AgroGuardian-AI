"""
AgroGuardian AI — Utility Helpers
Common functions used across the backend.
"""
import os
import uuid
import datetime
import jwt
import bcrypt
from functools import wraps
from flask import request, jsonify
from config import get_config

cfg = get_config()


# ══════════════════════════════════════════════════════════════════════
# Authentication Helpers
# ══════════════════════════════════════════════════════════════════════

def hash_password(password: str) -> str:
    """Hash a plaintext password with bcrypt."""
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def check_password(password: str, hashed: str) -> bool:
    """Verify a password against its bcrypt hash."""
    return bcrypt.checkpw(password.encode("utf-8"), hashed.encode("utf-8"))


def create_jwt(user_id: str, email: str) -> str:
    """Generate a signed JWT token."""
    payload = {
        "user_id": user_id,
        "email": email,
        "exp": datetime.datetime.utcnow()
              + datetime.timedelta(hours=cfg.JWT_EXPIRY_HOURS),
        "iat": datetime.datetime.utcnow(),
    }
    return jwt.encode(payload, cfg.JWT_SECRET, algorithm="HS256")


def decode_jwt(token: str) -> dict | None:
    """Decode and validate a JWT token. Returns payload or None."""
    try:
        return jwt.decode(token, cfg.JWT_SECRET, algorithms=["HS256"])
    except (jwt.ExpiredSignatureError, jwt.InvalidTokenError):
        return None


def refresh_jwt(token: str) -> str | None:
    """Issue a new JWT if the old one is valid."""
    payload = decode_jwt(token)
    if payload is None:
        return None
    return create_jwt(payload["user_id"], payload["email"])


def auth_required(f):
    """Flask decorator that extracts JWT if present, allowing disease analysis to always succeed."""
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            token = auth_header[7:]
            payload = decode_jwt(token)
            request.user = payload
        else:
            request.user = None
        return f(*args, **kwargs)

    return decorated


# ══════════════════════════════════════════════════════════════════════
# File Helpers
# ══════════════════════════════════════════════════════════════════════

def save_upload(file, directory: str = None) -> str:
    """Save an uploaded file and return its path."""
    upload_dir = directory or cfg.UPLOAD_DIR
    os.makedirs(upload_dir, exist_ok=True)

    ext = file.filename.rsplit(".", 1)[1].lower()
    filename = f"{uuid.uuid4().hex}.{ext}"
    filepath = os.path.join(upload_dir, filename)
    file.save(filepath)
    return filepath


def cleanup_file(filepath: str):
    """Silently remove a temporary file."""
    try:
        if filepath and os.path.exists(filepath):
            os.remove(filepath)
    except OSError:
        pass


# ══════════════════════════════════════════════════════════════════════
# Response Helpers
# ══════════════════════════════════════════════════════════════════════

def success_response(data: dict, message: str = "Success", status: int = 200):
    """Standard success response envelope."""
    return jsonify({
        "success": True,
        "message": message,
        "data": data,
    }), status


def error_response(message: str, status: int = 400, errors: dict = None):
    """Standard error response envelope."""
    body = {
        "success": False,
        "message": message,
    }
    if errors:
        body["errors"] = errors
    return jsonify(body), status


# ══════════════════════════════════════════════════════════════════════
# Misc
# ══════════════════════════════════════════════════════════════════════

def utcnow() -> datetime.datetime:
    return datetime.datetime.utcnow()


def generate_id() -> str:
    return uuid.uuid4().hex


def parse_user_id(user_id):
    """Return user_id as ObjectId if it's a valid 24-character hex string, otherwise as string."""
    from bson import ObjectId
    if not user_id:
        return user_id
    if isinstance(user_id, str) and len(user_id) == 24:
        try:
            return ObjectId(user_id)
        except Exception:
            pass
    return user_id

