"""
AgroGuardian AI — Application Configuration (FINAL VERSION)
"""

import os
from dotenv import load_dotenv

load_dotenv()


class Config:
    """Base configuration."""

    # =========================================
    # 🔥 FLASK
    # =========================================
    SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-key")
    DEBUG = os.getenv("FLASK_DEBUG", "false").lower() == "true"
    PORT = int(os.getenv("PORT", 5000))

    # =========================================
    # 🗄️ DATABASE
    # =========================================
    MONGO_URI = os.getenv(
        "MONGO_URI",
        "mongodb://localhost:27017/agroguardian"
    )

    # =========================================
    # 🔐 AUTH
    # =========================================
    JWT_SECRET = os.getenv("JWT_SECRET", "jwt-dev-secret")
    JWT_EXPIRY_HOURS = int(os.getenv("JWT_EXPIRY_HOURS", 24))

    # =========================================
    # 🤖 AI / NLP KEYS
    # =========================================
    OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
    OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
    GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.0-flash")

    # =========================================
    # 🌍 TRANSLATION
    # =========================================
    GOOGLE_TRANSLATE_API_KEY = os.getenv("GOOGLE_TRANSLATE_API_KEY", "")

    # =========================================
    # 🧠 ML MODEL CONFIG (FIXED)
    # =========================================
    BASE_DIR = os.path.dirname(__file__)

    ML_MODELS_DIR = os.path.join(BASE_DIR, "ml_models")

    # 🔥 FINAL MODEL (IMPORTANT)
    BEST_MODEL_PATH = os.path.join(ML_MODELS_DIR, "crop_model.h5")
    LABELS_PATH = os.path.join(ML_MODELS_DIR, "labels.json")

    # 🔥 IMAGE SETTINGS
    IMAGE_SIZE = (224, 224)
    BATCH_SIZE = 32

    # =========================================
    # 📁 FILE UPLOAD
    # =========================================
    ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "webp"}
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB

    UPLOAD_DIR = os.path.join(BASE_DIR, "uploads")

    # Ensure upload directory exists
    os.makedirs(UPLOAD_DIR, exist_ok=True)


# =========================================
# 🔧 ENV CONFIGS
# =========================================
class DevelopmentConfig(Config):
    DEBUG = True


class ProductionConfig(Config):
    DEBUG = False


config_map = {
    "development": DevelopmentConfig,
    "production": ProductionConfig,
}


def get_config():
    env = os.getenv("FLASK_ENV", "development")
    return config_map.get(env, DevelopmentConfig)()
