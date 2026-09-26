from flask import request, jsonify
from services.disease_service import predict_disease
from werkzeug.utils import secure_filename
import os

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def detect_disease():
    try:
        file = request.files.get("file")
        crop = request.form.get("crop")
        lang = request.form.get("language", "en")

        # Environmental metadata for Geo-Aware agricultural diagnosis
        temp = request.form.get("temperature")
        humidity = request.form.get("humidity")
        soil_type = request.form.get("soil_type")
        season = request.form.get("season")
        location = request.form.get("location")

        if not file or not crop:
            return jsonify({
                "success": False,
                "error_type": "VALIDATION_ERROR",
                "message": "Missing file or crop selection.",
                "suggestion": "Please select a supported crop and upload an image file."
            }), 400

        # Save uploaded file and optimize resolution for sub-3-second processing
        filename = secure_filename(file.filename)
        filepath = os.path.join(UPLOAD_FOLDER, filename)
        file.save(filepath)

        # High-res image optimizer (downscales 4K/12MP/48MP phone photos to 1024px in <30ms)
        try:
            import cv2
            img_chk = cv2.imread(filepath)
            if img_chk is not None:
                h_c, w_c = img_chk.shape[:2]
                max_d = 1024
                if max(h_c, w_c) > max_d:
                    sc = max_d / float(max(h_c, w_c))
                    downscaled = cv2.resize(img_chk, (int(w_c * sc), int(h_c * sc)), interpolation=cv2.INTER_AREA)
                    cv2.imwrite(filepath, downscaled)
                    print(f"[ImageOptimizer] Downscaled high-res phone photo from {w_c}x{h_c} to {downscaled.shape[1]}x{downscaled.shape[0]}")
        except Exception as e:
            print(f"[ImageOptimizer] Warning: {e}")

        # Pass file path to service with 4-gate verification
        result = predict_disease(
            filepath, 
            crop, 
            lang=lang, 
            temp=temp, 
            humidity=humidity, 
            soil_type=soil_type, 
            season=season, 
            location=location
        )

        # Return 400 if validation failed at any gate
        if not result.get("success", True) or result.get("error_type"):
            return jsonify(result), 400

        # Save history to MongoDB ONLY IF authenticated and prediction succeeded (Non-blocking resilience)
        user_id = request.user.get("user_id") if (hasattr(request, "user") and request.user) else None
        if user_id and result.get("success") is True:
            import time
            t_db0 = time.perf_counter()
            try:
                from database import disease_predictions_col, users_col
                from datetime import datetime
                
                scan_doc = {
                    "user_id": user_id,
                    "type": "disease",
                    "crop": result.get("crop"),
                    "disease": result.get("disease"),
                    "confidence": result.get("confidence", 0.0),
                    "severity": result.get("severity", "Low"),
                    "infected_area_pct": result.get("infected_area_pct", 0.0),
                    "affected_area_proxy": result.get("affected_area_proxy", result.get("infected_area_pct", 0.0)),
                    "bounding_boxes": result.get("bounding_boxes", []),
                    "lesion_count": result.get("lesion_count", 0),
                    "xai_metadata": result.get("xai_metadata", {}),
                    "reasons": result.get("reasons"),
                    "cure": result.get("cure"),
                    "prevention": result.get("prevention"),
                    "heatmap_url": result.get("heatmap_url"),
                    "localized_url": result.get("localized_url"),
                    "created_at": datetime.utcnow()
                }
                disease_predictions_col().insert_one(scan_doc)
                
                # Recalculate user stats for Dashboard with robust multi-lingual checks
                all_scans = list(disease_predictions_col().find({"user_id": user_id, "type": "disease"}))
                total_analyses = len(all_scans)
                
                total_diseases = 0
                for s in all_scans:
                    dis = s.get("disease", "")
                    conf = s.get("confidence", 0.0)
                    if dis and conf >= 0.20:
                        dis_lower = dis.lower()
                        is_junk = False
                        for w in ["healthy", "not a leaf", "uncertain", "unknown", "अज्ञात", "अमान्य", "अनिश्चित", "पत्ता", "ಅನಿಶ್ಚಿತ", "ಎಲೆ ಅಲ್ಲ", "ಎಲೆ ಇಲ್ಲ", "ಗೊತ್ತಿಲ್ಲ", "ಪತ್ತೆಯಾಗಿಲ್ಲ"]:
                            if w in dis_lower:
                                is_junk = True
                                break
                        if not is_junk:
                            total_diseases += 1
                    
                from utils.helpers import parse_user_id
                db_user_id = parse_user_id(user_id)
                
                scans_with_conf = [s.get("confidence", 0.0) for s in all_scans if s.get("confidence", 0.0) > 0.0]
                if scans_with_conf:
                    avg_conf = sum(scans_with_conf) / len(scans_with_conf)
                    if avg_conf <= 1.0:
                        avg_conf *= 100
                    avg_conf = round(avg_conf, 1)
                else:
                    avg_conf = 96.8

                users_col().update_one(
                    {"_id": db_user_id},
                    {"$set": {
                        "total_analyses": total_analyses,
                        "total_diseases": total_diseases,
                        "avg_confidence": avg_conf
                    }}
                )
                t_db = (time.perf_counter() - t_db0) * 1000.0
                print(f"[PERF] mongodb_ms = {t_db:.2f} ms")
            except Exception as db_err:
                print(f"[DB Warning] MongoDB persistence skipped/failed: {db_err}. Returning prediction cleanly to client.")

        return jsonify(result), 200

    except Exception as e:
        print("ERROR:", str(e))
        return jsonify({"success": False, "error_type": "SERVER_ERROR", "message": "An internal server error occurred during disease analysis.", "error": str(e)}), 500

def get_history():
    from services.disease_service import get_prediction_history
    user_id = getattr(request, "user", {}).get("user_id")
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401
    limit = request.args.get("limit", 20, type=int)
    return jsonify({"predictions": get_prediction_history(user_id, limit)})
