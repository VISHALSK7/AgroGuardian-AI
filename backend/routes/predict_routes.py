from flask import Blueprint
from controllers import disease_controller
from controllers.pest_controller import predict_pest
from controllers.yield_controller import predict_yield_handler
from controllers.weather_controller import predict_future_risk_handler
from utils.helpers import auth_required

predict_bp = Blueprint("predict", __name__)

@predict_bp.route("/predict/disease", methods=["POST"])
@auth_required
def predict_disease():
    return disease_controller.detect_disease()

# Keep other routes for platform stability
predict_bp.route("/disease/history", methods=["GET"], endpoint="get_history")(auth_required(disease_controller.get_history))
predict_bp.route("/predict/disease/history", methods=["GET"], endpoint="get_predict_history")(auth_required(disease_controller.get_history))
predict_bp.route("/pest", methods=["POST"])(auth_required(predict_pest))
predict_bp.route("/yield", methods=["POST"])(auth_required(predict_yield_handler))
predict_bp.route("/predict/weather-engine", methods=["POST"])(auth_required(predict_future_risk_handler))

