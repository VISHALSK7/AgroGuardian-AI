"""
AgroGuardian AI — Schemes Controller
"""
from flask import request
from utils.helpers import success_response, error_response
from utils.logger import get_logger
from services.schemes_service import get_all_schemes, get_scheme_by_id, log_application

log = get_logger("ctrl.schemes")


def get_schemes():
    """Handle GET /schemes?state=Karnataka&category=Insurance."""
    state = request.args.get("state")
    category = request.args.get("category")

    schemes = get_all_schemes(state, category)
    # Convert ObjectId etc. for JSON
    for s in schemes:
        s["_id"] = str(s["_id"])

    return success_response({"schemes": schemes, "count": len(schemes)})


def apply_scheme():
    """Handle POST /schemes/apply."""
    data = request.get_json(silent=True) or {}
    scheme_id = data.get("scheme_id")
    user_id = getattr(request, "user", {}).get("user_id")

    if not scheme_id:
        return error_response("scheme_id is required", 400)

    scheme = get_scheme_by_id(scheme_id)
    if not scheme:
        return error_response("Scheme not found", 404)

    ticket_id = log_application(user_id or "anonymous", scheme_id)
    return success_response(
        {"ticket_id": ticket_id, "scheme": scheme["name"]},
        "Application initiated",
        201,
    )
