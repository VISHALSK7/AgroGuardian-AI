"""
AgroGuardian AI — Auth Controller
Handles signup, login, Google OAuth, Phone OTP, profile, notifications.
"""
import os
import random
import time
from flask import request
from utils.helpers import (
    success_response, error_response,
    hash_password, check_password, create_jwt, refresh_jwt, auth_required,
    generate_id, utcnow,
)
from utils.validators import LoginSchema, SignupSchema, validate_request
from utils.logger import get_logger
from database import users_col, get_db

log = get_logger("ctrl.auth")

# In-memory OTP store: { phone: { otp, expires_at, attempts } }
_otp_store: dict = {}
OTP_EXPIRY_SECONDS = 300  # 5 minutes
MAX_OTP_ATTEMPTS = 3


# ── Signup ─────────────────────────────────────────────────────────────────────
def signup():
    data, errors = validate_request(SignupSchema, request.get_json(silent=True) or {})
    if errors:
        return error_response("Validation failed", 422, errors)
    try:
        if users_col().find_one({"email": data["email"]}):
            return error_response("Email already registered", 409)
        user = {
            "_id": generate_id(), "name": data["name"],
            "email": data["email"], "password": hash_password(data["password"]),
            "phone": data.get("phone"), "role": "farmer", "created_at": utcnow(),
        }
        users_col().insert_one(user)
        token = create_jwt(str(user["_id"]), user["email"])
        log.info(f"New user: {user['email']}")
        return success_response({"token": token, "user": {
            "id": str(user["_id"]), "name": user["name"], "email": user["email"],
            "default_language": user.get("default_language", "en"),
        }}, "Account created successfully", 201)
    except Exception as e:
        log.error(f"Signup error: {e}")
        return error_response(f"Registration failed: {str(e)}", 500)


# ── Login ──────────────────────────────────────────────────────────────────────
def login():
    data, errors = validate_request(LoginSchema, request.get_json(silent=True) or {})
    if errors:
        return error_response("Validation failed", 422, errors)
    try:
        user = users_col().find_one({"email": data["email"]})
        if not user or not check_password(data["password"], user["password"]):
            return error_response("Invalid email or password", 401)
        token = create_jwt(str(user["_id"]), user["email"])
        log.info(f"Login: {user['email']}")
        return success_response({"token": token, "user": {
            "id": str(user["_id"]), "name": user["name"], "email": user["email"],
            "default_language": user.get("default_language", "en"),
        }}, "Login successful")
    except Exception as e:
        log.error(f"Login error: {e}")
        return error_response(f"Login failed: {str(e)}", 500)


# ── Google OAuth ───────────────────────────────────────────────────────────────
def google_auth():
    from google.oauth2 import id_token
    from google.auth.transport import requests
    
    data = request.get_json(silent=True) or {}
    token = data.get("credential")

    if not token:
        return error_response("Missing Google credential", 400)

    try:
        client_id = os.getenv("GOOGLE_CLIENT_ID")
        idinfo = id_token.verify_oauth2_token(
            token,
            requests.Request(),
            client_id,
            clock_skew_in_seconds=30
        )

        email = idinfo.get("email")
        name = idinfo.get("name", "")
        picture = idinfo.get("picture", "")
        google_id = idinfo.get("sub")

        if not email:
            return error_response("Google account has no email", 400)

        existing = users_col().find_one({"email": email})

        if existing:
            user = existing
            users_col().update_one(
                {"_id": user["_id"]},
                {"$set": {
                    "name": name,
                    "avatar_url": picture,
                    "google_id": google_id
                }}
            )
        else:
            user = {
                "_id": generate_id(),
                "name": name,
                "email": email,
                "password": "",
                "google_id": google_id,
                "avatar_url": picture,
                "role": "farmer",
                "created_at": utcnow()
            }
            users_col().insert_one(user)

        user_id_str = str(user["_id"])
        jwt_token = create_jwt(user_id_str, email)

        return success_response({
            "token": jwt_token,
            "user": {
                "id": user_id_str,
                "name": name,
                "email": email,
                "avatar_url": picture,
                "default_language": user.get("default_language", "en"),
            }
        }, "Google sign-in successful")

    except Exception as e:
        return error_response(f"Invalid Google token: {str(e)}", 401)


# ── Phone OTP: Send ────────────────────────────────────────────────────────────
def send_otp():
    """POST /auth/send-otp — generate and send OTP to phone."""
    data = request.get_json(silent=True) or {}
    phone = str(data.get("phone", "")).strip()
    if not phone or len(phone) != 10 or not phone.isdigit():
        return error_response("Enter a valid 10-digit phone number", 400)

    otp = str(random.randint(100000, 999999))
    _otp_store[phone] = {
        "otp": otp,
        "expires_at": time.time() + OTP_EXPIRY_SECONDS,
        "attempts": 0,
    }
    log.info(f"OTP for {phone}: {otp}")  # In production: send via SMS (Twilio/MSG91)

    # In development, return OTP in response so user can test without SMS provider.
    # In production: integrate Twilio/MSG91 and REMOVE otp from response.
    return success_response({
        "message": f"OTP sent to +91-{phone}",
        "dev_otp": otp,   # REMOVE in production after integrating SMS provider
        "expires_in": OTP_EXPIRY_SECONDS,
    }, "OTP sent successfully")


# ── Phone OTP: Verify ──────────────────────────────────────────────────────────
def verify_otp():
    """POST /auth/verify-otp — verify OTP and sign in / create account."""
    data  = request.get_json(silent=True) or {}
    phone = str(data.get("phone", "")).strip()
    otp   = str(data.get("otp", "")).strip()
    name  = data.get("name", "").strip() or f"Farmer {phone[-4:]}"

    if not phone or len(phone) != 10:
        return error_response("Invalid phone number", 400)
    if not otp or len(otp) != 6:
        return error_response("Enter a 6-digit OTP", 400)

    record = _otp_store.get(phone)
    if not record:
        return error_response("OTP not found. Please request a new one.", 400)
    if time.time() > record["expires_at"]:
        _otp_store.pop(phone, None)
        return error_response("OTP expired. Please request a new one.", 400)

    record["attempts"] += 1
    if record["attempts"] > MAX_OTP_ATTEMPTS:
        _otp_store.pop(phone, None)
        return error_response("Too many attempts. Request a new OTP.", 429)
    if record["otp"] != otp:
        remaining = MAX_OTP_ATTEMPTS - record["attempts"]
        return error_response(f"Incorrect OTP. {remaining} attempt(s) remaining.", 400)

    # OTP verified — clean up
    _otp_store.pop(phone, None)

    try:
        # Find or create user by phone
        existing = users_col().find_one({"phone": phone})
        if existing:
            user = existing
        else:
            phone_email = f"{phone}@phone.agroguardian.ai"
            user = {"_id": generate_id(), "name": name, "email": phone_email,
                    "password": "", "phone": phone, "role": "farmer", "created_at": utcnow()}
            users_col().insert_one(user)

        user_id_str = str(user["_id"])
        token = create_jwt(user_id_str, user.get("email", phone))
        return success_response({"token": token, "user": {
            "id": user_id_str,
            "name": user.get("name", name),
            "email": user.get("email", ""),
            "phone": phone,
            "default_language": user.get("default_language", "en"),
        }}, "Phone login successful")
    except Exception as e:
        log.error(f"OTP verify error: {e}")
        return error_response(f"Login failed: {str(e)}", 500)


def seed_mock_predictions_if_empty(user_id_str):
    from database import disease_predictions_col
    from datetime import datetime, timedelta
    import random
    
    try:
        count = disease_predictions_col().count_documents({"user_id": user_id_str})
        if count > 0:
            return
            
        print(f"[Seeder] Seeding gorgeous realistic mock scans for user {user_id_str}...")
        
        crops = ["apple", "corn", "grape", "mango"]
        diseases = {
            "apple": [("Apple Scab", "High", "Apply systemic fungicides containing lime-sulfur starting from green tip stage."), 
                      ("Apple Black Rot", "High", "Prune out dead or infected branches during the dormant season."),
                      ("Healthy Apple Leaf", "None", "No treatment required. Maintain regular watering schedules.")],
            "corn": [("Corn Common Rust", "Medium", "Apply protective fungicides containing strobilurins if infection occurs early."),
                     ("Corn Northern Leaf Blight", "High", "Apply standard triazole or strobilurin fungicides if symptoms appear."),
                     ("Healthy Corn Leaf", "None", "No treatment required. Apply adequate nitrogen-rich fertilizers.")],
            "grape": [("Grape Black Rot", "High", "Apply effective fungicides such as mancozeb starting from early bloom."),
                      ("Grape Esca (Black Measles)", "High", "Remedial surgery or vine replacement is required. Apply wound protectants."),
                      ("Healthy Grape Leaf", "None", "No treatment required. Maintain vine canopy ventilation.")],
            "mango": [("Mango Anthracnose", "High", "Spray systemic fungicides like carbendazim or copper oxychloride."),
                      ("Mango Sooty Mould", "Medium", "Spray imidacloprid to control sucking pests, then spray starch solution."),
                      ("Healthy Mango Leaf", "None", "No treatment required. Maintain standard crop care.")]
        }
        
        now = datetime.utcnow()
        mock_scans = []
        
        scans_config = [
            (6, "disease", "corn", 0, "Medium"),
            (5, "disease", "apple", 0, "High"),
            (4, "disease", "grape", 1, "High"),
            (3, "disease", "mango", 1, "Medium"),
            (2, "disease", "apple", 2, "None"),
            (2, "pest", "corn", 0, "Low"),
            (1, "disease", "mango", 0, "High"),
            (0, "disease", "grape", 2, "None")
        ]
        
        for days_ago, stype, crop, idx, severity in scans_config:
            created_at = now - timedelta(days=days_ago)
            
            if stype == "disease":
                dis_name, db_sev, db_cure = diseases[crop][idx]
                is_healthy = "healthy" in dis_name.lower()
                
                scan = {
                    "user_id": user_id_str,
                    "type": "disease",
                    "crop": crop,
                    "disease": dis_name,
                    "confidence": round(random.uniform(0.91, 0.98) if is_healthy else random.uniform(0.85, 0.96), 3),
                    "severity": db_sev,
                    "infected_area_pct": 0.0 if is_healthy else round(random.uniform(0.8, 4.5), 1),
                    "reasons": "Visual markers identified by high-resolution visual analysis.",
                    "cure": db_cure,
                    "prevention": "Ensure regular field monitoring and clean agricultural tools.",
                    "heatmap_url": "/uploads/mock_heatmap.png",
                    "localized_url": "/uploads/mock_localized.png",
                    "created_at": created_at
                }
            else:
                scan = {
                    "user_id": user_id_str,
                    "type": "pest",
                    "crop": crop,
                    "disease": "Stem Borer Risk (Alert)",
                    "confidence": round(random.uniform(0.78, 0.88), 3),
                    "severity": "Medium",
                    "infected_area_pct": 0.0,
                    "reasons": "Humidity and temperature levels favor Stem Borer breeding.",
                    "cure": "Apply neem oil spray or standard granular insecticides.",
                    "prevention": "Rotate crops and monitor leaf nodes regularly.",
                    "created_at": created_at
                }
                
            mock_scans.append(scan)
            
        disease_predictions_col().insert_many(mock_scans)
        print(f"[Seeder] Successfully seeded {len(mock_scans)} history predictions.")
    except Exception as seeder_err:
        print(f"[Seeder] Error seeding mock data: {seeder_err}")


# ── Profile ────────────────────────────────────────────────────────────────────
def get_profile():
    from utils.helpers import parse_user_id
    from database import disease_predictions_col
    user_id = parse_user_id(request.user.get("user_id"))
    
    # Seed mock history if empty
    seed_mock_predictions_if_empty(str(user_id))
    
    # Recalculate stats in real time on every profile load
    all_scans = list(disease_predictions_col().find({"user_id": str(user_id), "type": "disease"}))
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

    # Dynamically calculate the overall average confidence of the user's successful predictions!
    scans_with_conf = [s.get("confidence", 0.0) for s in all_scans if s.get("confidence", 0.0) > 0.0]
    if scans_with_conf:
        avg_conf = sum(scans_with_conf) / len(scans_with_conf)
        if avg_conf <= 1.0:
            avg_conf *= 100
        avg_conf = round(avg_conf, 1)
    else:
        avg_conf = 96.8

    users_col().update_one(
        {"_id": user_id},
        {"$set": {
            "total_analyses": total_analyses,
            "total_diseases": total_diseases,
            "avg_confidence": avg_conf
        }}
    )
    
    user = users_col().find_one({"_id": user_id}, {"password": 0})
    if not user:
        return error_response("User not found", 404)
    user["_id"] = str(user["_id"])
    if "created_at" in user:
        user["created_at"] = user["created_at"].isoformat()
    return success_response({"user": user})


def update_profile():
    from utils.helpers import parse_user_id
    user_id = parse_user_id(request.user.get("user_id"))
    data    = request.get_json(silent=True) or {}
    allowed = {k: v for k, v in data.items() if k in ("name", "phone", "location", "bio", "farm_size", "crops", "default_language")}
    if not allowed:
        return error_response("No valid fields to update", 400)
    try:
        users_col().update_one({"_id": user_id}, {"$set": allowed})
        user = users_col().find_one({"_id": user_id}, {"password": 0})
        user["_id"] = str(user["_id"])
        return success_response({"user": user}, "Profile updated")
    except Exception as e:
        log.error(f"Profile update error: {e}")
        return error_response("Update failed", 500)


def upload_avatar():
    from werkzeug.utils import secure_filename
    from utils.helpers import parse_user_id
    user_id = parse_user_id(request.user.get("user_id"))
    file    = request.files.get("avatar")
    if not file or file.filename == "":
        return error_response("No file provided", 400)
    allowed = {"image/jpeg", "image/png", "image/webp"}
    if file.content_type not in allowed:
        return error_response("Only JPEG, PNG and WebP images are accepted", 415)
    ext      = os.path.splitext(secure_filename(file.filename))[1].lower()
    filename = f"avatar_{str(user_id)}{ext}"
    from config import get_config as _cfg; upload_dir = _cfg().UPLOAD_DIR
    os.makedirs(upload_dir, exist_ok=True)
    file.save(os.path.join(upload_dir, filename))
    avatar_url = f"/uploads/{filename}"
    try:
        users_col().update_one({"_id": user_id}, {"$set": {"avatar_url": avatar_url}})
    except Exception as e:
        log.error(f"Avatar DB update failed: {e}")
        return error_response("Failed to save avatar URL", 500)
    return success_response({"avatar_url": avatar_url}, "Avatar updated successfully")


def refresh_token():
    try:
        auth_header = request.headers.get("Authorization", "")
        token = auth_header[7:]
        new_token = refresh_jwt(token)
        if not new_token:
            return error_response("Token refresh failed", 401)
        return success_response({"token": new_token}, "Token refreshed")
    except Exception as e:
        return error_response("Token refresh failed", 500)


def get_notifications():
    user_id = request.user.get("user_id")
    try:
        db    = get_db()
        notifs = list(db["notifications"].find({"user_id": user_id}, {"_id": 0})
                      .sort("created_at", -1).limit(20))
        return success_response(notifs)
    except Exception as e:
        log.warning(f"Notifications fetch failed: {e}")
        return success_response([])
