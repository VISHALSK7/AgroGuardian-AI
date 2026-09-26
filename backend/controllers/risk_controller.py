"""
AgroGuardian AI — Risk Controller
"""
from flask import request
from utils.helpers import success_response, error_response
from utils.logger import get_logger
from services.risk_service import calculate_risk, calculate_regional_risk
from services.weather_service import get_forecast

log = get_logger("ctrl.risk")


def analyse_risk():
    """POST /risk/analyse — composite risk from weather + pest + disease data."""
    data = request.get_json(silent=True) or {}

    try:
        from services.weather_service import get_forecast
        
        crop = data.get("crop") or data.get("crop_type") or "Corn"
        city = data.get("city") or data.get("location") or "Mysore"
        date_str = data.get("date", "2026-05-28")
        time_str = data.get("time", "14:00")
        
        weather_api_res = None
        try:
            weather_api_res = get_forecast(city)
        except Exception:
            pass

        # Determine standard weather metrics from forecast if not provided in overrides
        baseline_weather = {"temperature": 25.0, "humidity": 60.0, "rainfall": 0.0, "wind": 10.0}
        if weather_api_res and "forecast" in weather_api_res and len(weather_api_res["forecast"]) > 0:
            current_day = weather_api_res["forecast"][0]
            baseline_weather = {
                "temperature": float(current_day.get("temperature", 25.0)),
                "humidity": float(current_day.get("humidity", 60.0)),
                "rainfall": float(current_day.get("rainfall", 0.0)),
                "wind": float(current_day.get("wind", 10.0))
            }
            
        weather = {
            "temperature": float(data.get("temperature") if data.get("temperature") is not None else baseline_weather["temperature"]),
            "humidity": float(data.get("humidity") if data.get("humidity") is not None else baseline_weather["humidity"]),
            "rainfall": float(data.get("rainfall") if data.get("rainfall") is not None else baseline_weather["rainfall"]),
            "wind": float(data.get("wind") if data.get("wind") is not None else baseline_weather["wind"])
        }

        result = calculate_risk(crop, city, date_str, time_str, weather)
        result["weather_data"] = weather

        # Dynamic translation of result fields if target language is regional
        lang = data.get("language") or request.args.get("language") or "en"
        if lang and lang != "en":
            from services.translation_service import translate_text
            
            result["disease_name"] = translate_text(result["disease_name"], lang)
            result["risk_level"] = translate_text(result["risk_level"], lang)
            result["outbreak_window"] = translate_text(result["outbreak_window"], lang)
            result["why_expert"] = translate_text(result["why_expert"], lang)
            result["why_farmer"] = translate_text(result["why_farmer"], lang)
            result["susceptibility"] = translate_text(result["susceptibility"], lang)
            result["spread_pattern"] = translate_text(result["spread_pattern"], lang)
            
            # Translate nested remedies
            if "remedies" in result:
                for rkey in ["fungicide", "preventive", "irrigation", "sanitation"]:
                    if rkey in result["remedies"]:
                        result["remedies"][rkey] = translate_text(result["remedies"][rkey], lang)
            
            # Translate list of recommendations
            if "recommendations" in result:
                result["recommendations"] = [translate_text(item, lang) for item in result["recommendations"]]
        
        return success_response(result, "Risk analysis complete")
    except Exception as e:
        log.error(f"Risk analyse error: {e}")
        return error_response(f"Risk analysis failed: {str(e)}", 500)



def get_risk_weather():
    """GET /risk/weather — weather forecast for risk page."""
    city = request.args.get("city", "Mysore,IN")
    days = request.args.get("days", 7, type=int)
    try:
        result = get_forecast(city, days)
        return success_response(result)
    except Exception as e:
        return error_response(str(e), 500)


def analyse_regional_risk():
    """
    POST /risk/regional — Implements Equation (11) distance-weighted spatial interpolation:
    R_regional(t) = sum_{k=1}^{N_f} w_k * R(t_k)
    where w_k = d_k^(-p) / sum_{j=1}^{N_f} d_j^(-p)
    """
    data = request.get_json(silent=True) or {}
    try:
        target_lat = float(data.get("lat") or data.get("target_lat") or 12.2958)
        target_lon = float(data.get("lon") or data.get("target_lon") or 76.6394)
        crop = data.get("crop", "Apple")
        power = float(data.get("power", 2.0))
        farms = data.get("farms")

        result = calculate_regional_risk(target_lat, target_lon, crop, power, farms)
        return success_response(result, "Regional risk analysis complete")
    except Exception as e:
        log.error(f"Regional risk error: {e}")
        return error_response(f"Regional risk analysis failed: {str(e)}", 500)
