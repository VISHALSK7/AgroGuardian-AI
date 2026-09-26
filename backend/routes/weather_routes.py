"""
AgroGuardian AI — Weather Routes Blueprint
"""
from flask import Blueprint
from controllers.weather_controller import get_weather

weather_bp = Blueprint("weather", __name__)

# GET /weather?days=7
weather_bp.route("", methods=["GET"])(get_weather)
