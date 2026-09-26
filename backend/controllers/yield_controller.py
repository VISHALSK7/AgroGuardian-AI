"""
AgroGuardian AI — Yield Prediction Controller
"""
from flask import request
from utils.helpers import success_response, error_response
from utils.validators import YieldInputSchema, validate_request
from utils.logger import get_logger
from services.yield_service import predict_yield

log = get_logger("ctrl.yield")


def predict_yield_handler():
    """Handle POST /predict/yield."""
    data, errors = validate_request(YieldInputSchema, request.get_json(silent=True) or {})
    if errors:
        return error_response("Validation failed", 422, errors)

    try:
        from services.yield_service import predict_yield
        
        result = predict_yield(
            crop_type=data.get("crop") or data.get("crop_type"),
            soil_type=data.get("soil_type"),
            irrigation_type=data.get("irrigation_type"),
            season=data.get("season"),
            area=data.get("area"),
            fertilizer_usage=data.get("fertilizer_usage", 100.0),
            pesticide_usage=data.get("pesticide_usage", 100.0),
            soil_quality=data.get("soil_quality", 80.0),
            whatif_rainfall=data.get("whatif_rainfall", 0.0),
            whatif_fertilizer=data.get("whatif_fertilizer", 0.0),
            whatif_irrigation=data.get("whatif_irrigation", 0.0)
        )
        
        # Add metadata
        result["metadata"] = {
            "area": data.get("area"),
            "soil_type": data.get("soil_type"),
            "irrigation": data.get("irrigation_type"),
            "season": data.get("season"),
            "fertilizer_usage": data.get("fertilizer_usage"),
            "pesticide_usage": data.get("pesticide_usage"),
            "soil_quality": data.get("soil_quality")
        }
        
        # Dynamic translation of result fields if target language is regional
        lang = data.get("language") or request.args.get("language") or "en"
        if lang and lang != "en":
            from services.translation_service import translate_text
            
            result["profitability"] = translate_text(result["profitability"], lang)
            if "factors" in result:
                for f in result["factors"]:
                    f["factor"] = translate_text(f["factor"], lang)
                    f["impact"] = translate_text(f["impact"], lang)
            if "optimization" in result and "recommendations" in result["optimization"]:
                result["optimization"]["recommendations"] = [translate_text(item, lang) for item in result["optimization"]["recommendations"]]

        return success_response(result, "Yield prediction complete")


    except ValueError as e:
        return error_response(str(e), 400)
    except Exception as e:
        log.error(f"Yield prediction error: {e}")
        return error_response(f"Prediction failed: {str(e)}", 500)
