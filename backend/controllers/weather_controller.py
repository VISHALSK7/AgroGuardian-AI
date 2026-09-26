"""
AgroGuardian AI — Weather & Disease Spread Controller
"""
from flask import request
from utils.helpers import success_response, error_response
from utils.logger import get_logger
from services.weather_service import get_forecast, predict_future_risk
from services.translation_service import translate_text

log = get_logger("ctrl.weather")


def get_weather():
    """Handle GET /weather?days=7&city=Mysore,IN."""
    days = request.args.get("days", 7, type=int)
    days = min(max(days, 1), 10)  # Clamp 1-10
    city = request.args.get("city", "Mysore,IN")

    try:
        result = get_forecast(city, days)
        return success_response(result, f"{days}-day weather forecast for {city}")
    except Exception as e:
        log.error(f"Weather forecast error: {e}")
        return error_response(f"Forecast failed: {str(e)}", 500)


def predict_future_risk_handler():
    """Handle POST /predict/weather-engine with optional language translation."""
    data = request.get_json() or {}
    crop = data.get("crop", "Corn")
    location = data.get("location", "Mysore")
    date_str = data.get("date", "2026-06-05")
    time_str = data.get("time", "16:00")
    language = data.get("language", "en")

    try:
        result = predict_future_risk(crop, location, date_str, time_str)

        # Translate results if language is not English
        if language in ("kn", "hi"):
            result = _translate_result(result, language)

        return success_response(result, f"Disease spread prediction for {crop} in {location}")
    except Exception as e:
        log.error(f"Weather engine error: {e}")
        return error_response(f"Prediction engine failed: {str(e)}", 500)


def _translate_result(result, language):
    """Translate disease names, causes, cures, and explanations."""
    try:
        for disease in result.get("diseases", []):
            # Translate disease name
            disease["disease_name"] = translate_text(disease.get("disease_name", ""), language)

            # Translate farmer explanation
            if disease.get("farmer_explanation"):
                disease["farmer_explanation"] = translate_text(disease["farmer_explanation"], language)

            # Translate risk level
            disease["risk_level"] = translate_text(disease.get("risk_level", ""), language)

            # Translate cause factors
            for factor in disease.get("cause_factors", []):
                factor["factor"] = translate_text(factor.get("factor", ""), language)
                factor["impact"] = translate_text(factor.get("impact", ""), language)

            # Translate remedies (prevention + cure)
            actions = disease.get("recommended_actions", {})
            for key in actions:
                if actions[key]:
                    actions[key] = translate_text(actions[key], language)

            # Translate prevention and cure lists
            remedies = disease.get("remedies", {})
            if remedies:
                if remedies.get("prevention"):
                    remedies["prevention"] = [translate_text(p, language) for p in remedies["prevention"]]
                if remedies.get("cure"):
                    remedies["cure"] = [translate_text(c, language) for c in remedies["cure"]]

    except Exception as e:
        log.warning(f"Translation error (non-fatal): {e}")

    return result
