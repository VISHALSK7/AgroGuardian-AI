"""
AgroGuardian AI — Risk Routes
"""
from flask import Blueprint
from utils.helpers import auth_required
from controllers.risk_controller import analyse_risk, get_risk_weather, analyse_regional_risk

risk_bp = Blueprint('risk', __name__)

risk_bp.route('/analyse',  methods=['POST'])(auth_required(analyse_risk))
risk_bp.route('/weather',  methods=['GET'])(auth_required(get_risk_weather))

risk_bp.route('/regional', methods=['POST'])(auth_required(analyse_regional_risk))
