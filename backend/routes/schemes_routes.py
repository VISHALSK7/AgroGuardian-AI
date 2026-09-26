"""
AgroGuardian AI — Government Schemes Routes Blueprint
"""
from flask import Blueprint
from controllers.schemes_controller import get_schemes, apply_scheme

schemes_bp = Blueprint("schemes", __name__)

# GET  /schemes?state=Karnataka&category=Insurance
schemes_bp.route("", methods=["GET"])(get_schemes)

# POST /schemes/apply
schemes_bp.route("/apply", methods=["POST"])(apply_scheme)
