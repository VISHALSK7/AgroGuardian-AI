"""
AgroGuardian AI — Chatbot Controller (FINAL PRODUCTION VERSION)
"""

from flask import request, send_file
from utils.helpers import success_response, error_response
from utils.validators import ChatbotInputSchema, validate_request
from utils.logger import get_logger
from services.chatbot_service import chat, get_chat_history, generate_tts_audio

from ai.image_analyzer import predict_disease
from ai.nlp_engine import generate_disease_explanation
from ai.language_utils import translate_text

log = get_logger("ctrl.chatbot")


# =========================================
# 🔥 TEXT CHAT (UNCHANGED - WORKING)
# =========================================
def handle_chat():
    try:
        print("Chat request received:", request.json)
        req_data = request.get_json(silent=True)
        if not req_data:
            return error_response("Invalid or missing JSON body", 400)

        data, errors = validate_request(ChatbotInputSchema, req_data)
        if errors:
            return error_response("Validation failed", 422, errors)

        user = getattr(request, "user", None)
        user_id = user.get("user_id") if isinstance(user, dict) else None

        query = data.get("query")
        if not query:
            return error_response("Query is required", 400)

        result = chat(
            query=query,
            language=data.get("language", "en"),
            session_id=data.get("session_id"),
            user_id=user_id,
        )

        return success_response(result, "Chatbot response generated")

    except Exception as e:
        log.error(f"❌ Chatbot error: {str(e)}")
        return error_response("Chatbot failed", 500)


def handle_tts():
    try:
        data = request.get_json(silent=True) or {}
        text = (data.get("text") or "").strip()
        language = data.get("language")
        if not text:
            return error_response("Text is required", 400)

        audio, lang = generate_tts_audio(text[:4000], language)
        if not audio:
            return error_response("Voice generation failed", 500)

        return send_file(
            audio,
            mimetype="audio/mpeg",
            as_attachment=False,
            download_name=f"agroguardian-{lang}.mp3",
        )

    except Exception as e:
        log.error(f"❌ TTS error: {str(e)}")
        return error_response("Voice generation failed", 500)


def _read_text_attachment(file_storage):
    raw = file_storage.read()
    file_storage.seek(0)
    name = file_storage.filename or "attachment"
    mime = file_storage.mimetype or "application/octet-stream"

    if mime.startswith("image/"):
        return None

    try:
        text = raw.decode("utf-8", errors="ignore")
    except Exception:
        text = ""

    text = " ".join(text.split())
    if not text:
        text = f"The uploaded file '{name}' could not be read as plain text. Type a question about it or upload a text/csv file."

    return f"File name: {name}\nFile type: {mime}\nExtracted text preview: {text[:2500]}"


def handle_chat_file():
    try:
        if "file" not in request.files:
            return error_response("No file uploaded", 400)

        file = request.files["file"]
        query = request.form.get("query") or "Analyze this uploaded file for AgroGuardian farming context."
        language = request.form.get("language")
        session_id = request.form.get("session_id")

        if (file.mimetype or "").startswith("image/"):
            return error_response("Use /api/chatbot/image for image analysis", 400)

        user = getattr(request, "user", None)
        user_id = user.get("user_id") if isinstance(user, dict) else None
        attachment_context = _read_text_attachment(file)

        result = chat(
            query=query,
            language=language,
            session_id=session_id,
            user_id=user_id,
            attachment_context=attachment_context,
        )

        return success_response({
            **result,
            "file": {
                "name": file.filename,
                "type": file.mimetype,
            }
        }, "File analyzed successfully")

    except Exception as e:
        log.error(f"❌ File chat error: {str(e)}")
        return error_response("File analysis failed", 500)


# =========================================
# 🔥 GET CHAT HISTORY
# =========================================
def get_history():
    try:
        session_id = request.args.get("session_id")

        if not session_id:
            return error_response("session_id is required", 400)

        user = getattr(request, "user", None)
        user_id = user.get("user_id") if isinstance(user, dict) else None

        history = get_chat_history(
            session_id=session_id,
            user_id=user_id
        )

        return success_response({"messages": history})

    except Exception as e:
        log.error(f"❌ History error: {str(e)}")
        return error_response("Failed to fetch history", 500)


from ai.leaf_validator import is_valid_leaf
from ai.model_router import validate_crop
from ai.disease_info import get_disease_info
from utils.response_builder import build_success, build_error, build_invalid, build_uncertain

def auto_detect_language(text):
    """
    Auto-detects Hindi or Kannada character scripts from queries or chat context
    to respond automatically in the correct language.
    """
    if not text:
        return "english"
    # Devanagari range: 0900-097F
    # Kannada range: 0C80-0CFF
    has_kannada = any(0x0C80 <= ord(c) <= 0x0CFF for c in text)
    has_hindi = any(0x0900 <= ord(c) <= 0x097F for c in text)
    if has_kannada:
        return "kannada"
    elif has_hindi:
        return "hindi"
    return "english"

# =========================================
# 🔥 IMAGE CHAT (MAIN AI FEATURE)
# =========================================
def handle_chat_image():
    try:
        # 🔥 VALIDATION
        if 'image' not in request.files:
            return error_response("No image uploaded", 400)

        file = request.files['image']
        selected_crop = request.form.get("crop")  # 🔥 FROM DROPDOWN
        query = request.form.get("query", "")
        lang = request.form.get("language")
        
        # Auto-detect language if not explicitly set
        if not lang or lang.lower() in ["english", "en"]:
            lang = auto_detect_language(query)

        log.info(f"📥 Chat Image received | Crop: {selected_crop} | Detected Lang: {lang}")

        # 🔥 MODEL PREDICTION
        result = predict_disease(file, selected_crop)
        status = result.get("status")
        predictions = result.get("predictions", [])

        if status == "error":
            log.error("❌ Prediction failed")
            return error_response("Image processing failed", 500)

        # 🔥 VALIDATE LEAF (BLUR / CLUTTER CHECKED)
        if status == "invalid":
            log.warning("❌ Invalid image detected by CV image_analyzer")
            message = result.get("message", "This does not appear to be a valid crop leaf image.")
            if lang != "english":
                message = translate_text(message, lang)
            return success_response(build_invalid(message, predictions), "Invalid image")

        # 🔥 VALIDATE CROP
        crop_match = validate_crop(predictions, selected_crop)
        if crop_match == "mismatch":
            log.warning("⚠️ Crop mismatch")
            message = f"Uploaded image does not match selected crop ({selected_crop})."
            if lang != "english":
                message = translate_text(message, lang)
            return success_response({
                "status": "mismatch",
                "message": message,
                "predictions": predictions
            }, "Crop mismatch")

        # 🔥 UNCERTAIN
        if status == "uncertain":
            log.warning("⚠️ Low confidence prediction")
            message = result.get("message", "Leaf detected but disease confidence is low.")
            if lang != "english":
                message = translate_text(message, lang)
            response = build_uncertain(predictions)
            response["message"] = message
            response["confidence_explanation"] = result.get("confidence_explanation")
            response["secondary_disease"] = result.get("secondary_disease")
            return success_response(response, "Low confidence prediction")

        # ✅ SUCCESS
        top = predictions[0]
        crop = result.get("crop")
        disease = result.get("disease")
        confidence = result.get("confidence")
        secondary_disease = result.get("secondary_disease")
        confidence_explanation = result.get("confidence_explanation")

        log.info(f"✅ Prediction: {disease} ({confidence:.2f})")

        # 🔥 DISEASE INFO
        disease_info = get_disease_info(disease)

        # 🔥 AI EXPLANATION
        explanation = generate_disease_explanation(disease, lang)

        cure = disease_info["cure"]
        prevention = disease_info["prevention"]

        if lang != "english":
            cure = translate_text(cure, lang)
            prevention = translate_text(prevention, lang)

        return success_response({
            "status": "success",
            "crop": crop,
            "disease": disease,
            "confidence": confidence,
            "secondary_disease": secondary_disease,
            "confidence_explanation": confidence_explanation,
            "cure": cure,
            "prevention": prevention,
            "explanation": explanation,
            "top_predictions": predictions
        }, "Image analyzed successfully")

    except Exception as e:
        log.error(f"❌ Chat Image error: {str(e)}")
        return error_response("Image analysis failed", 500)


def handle_translate():
    try:
        data = request.get_json(silent=True) or {}
        text = data.get("text")
        texts = data.get("texts")  # Support translating multiple texts
        language = data.get("language", "en")
        
        if not language:
            return error_response("Language is required", 400)
            
        if texts and isinstance(texts, list):
            translated_list = [translate_text(t, language) if t else "" for t in texts]
            return success_response({"translated": translated_list})
            
        if texts and isinstance(texts, dict):
            translated_dict = {}
            for k, v in texts.items():
                if v and isinstance(v, str):
                    translated_dict[k] = translate_text(v, language)
                else:
                    translated_dict[k] = v
            return success_response({"translated": translated_dict})
            
        if text:
            translated = translate_text(text, language)
            return success_response({"translated": translated})
            
        return error_response("text or texts is required", 400)
        
    except Exception as e:
        log.error(f"❌ Translation error: {str(e)}")
        return error_response("Translation failed", 500)

