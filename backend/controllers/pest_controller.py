"""
AgroGuardian AI — Pest Prediction Controller
"""
from flask import request
from utils.helpers import success_response, error_response
from utils.validators import PestInputSchema, validate_request
from utils.logger import get_logger

log = get_logger("ctrl.pest")


def predict_pest():
    """Handle POST /predict/pest."""
    data, errors = validate_request(PestInputSchema, request.get_json(silent=True) or {})
    if errors:
        return error_response("Validation failed", 422, errors)

    try:
        from services.weather_service import get_forecast
        from services.pest_service import predict_pest as run_pest_prediction
        
        target = data.get("location") or data.get("city") or "Mysore"
        weather_api_res = None
        try:
            weather_api_res = get_forecast(target)
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
        
        # Override with custom sliders if provided
        temperature = data.get("temperature") if data.get("temperature") is not None else baseline_weather["temperature"]
        humidity = data.get("humidity") if data.get("humidity") is not None else baseline_weather["humidity"]
        rainfall = data.get("rainfall") if data.get("rainfall") is not None else baseline_weather["rainfall"]
        wind = data.get("wind") if data.get("wind") is not None else baseline_weather["wind"]
        soil_moisture = data.get("soil_moisture") if data.get("soil_moisture") is not None else 55.0

        params = {
            "temperature": temperature,
            "humidity": humidity,
            "rainfall": rainfall,
            "wind": wind,
            "soil_moisture": soil_moisture,
            "region": target,
            "month": data.get("month", 6),
            "date": data.get("date", "2026-06-05"),
            "time": data.get("time", "16:00")
        }

        result = run_pest_prediction(data["crop_type"], params)

        # Dynamic translation of result fields if target language is regional
        lang = data.get("language") or request.args.get("language") or "en"
        if lang and lang != "en":
            from services.translation_service import translate_text
            
            # Translate direct string attributes
            result["primary_pest"] = translate_text(result["primary_pest"], lang)
            result["risk_level"] = translate_text(result["risk_level"], lang)
            result["expert_explanation"] = translate_text(result["expert_explanation"], lang)
            result["farmer_explanation"] = translate_text(result["farmer_explanation"], lang)
            if result.get("alert"):
                result["alert"] = translate_text(result["alert"], lang)
                
            # Translate nested spray window details
            if "spray_window" in result:
                result["spray_window"]["label"] = translate_text(result["spray_window"]["label"], lang)
                result["spray_window"]["suitability"] = translate_text(result["spray_window"]["suitability"], lang)
                result["spray_window"]["reason"] = translate_text(result["spray_window"]["reason"], lang)
                
            # Translate mitigation recommendations
            if "recommendations" in result:
                for rkey in ["prevention", "chemical", "biological", "irrigation"]:
                    if rkey in result["recommendations"]:
                        result["recommendations"][rkey] = [translate_text(item, lang) for item in result["recommendations"][rkey]]
                        
            # Translate contributor metrics
            if "contributors" in result:
                for c in result["contributors"]:
                    c["factor"] = translate_text(c["factor"], lang)
                    c["details"] = translate_text(c["details"], lang)

        return success_response(result, "Pest outbreak risk assessment complete")

    except ValueError as e:
        return error_response(str(e), 400)
    except Exception as e:
        log.error(f"Pest prediction error: {e}")
        return error_response(f"Prediction failed: {str(e)}", 500)
