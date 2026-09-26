"""
AgroGuardian AI — Flask Application Entry Point
"""

import os
from threading import Thread
from flask import Flask, jsonify, send_from_directory
from flask_cors import CORS
from dotenv import load_dotenv

# Load env
load_dotenv()

# Local imports
from config import get_config
from database import init_indexes
from services.schemes_service import seed_schemes
from utils.logger import get_logger

# Routes
from routes.predict_routes import predict_bp
from routes.weather_routes import weather_bp
from routes.schemes_routes import schemes_bp
from routes.chatbot_routes import chatbot_bp
from routes.auth_routes import auth_bp
from routes.risk_routes import risk_bp

log = get_logger("app")


# 🔥 UPDATED: Clean warmup (NO OLD MODEL)
def _warmup_models():
    try:
        from ai.image_analyzer import model
        if model:
            print("Model warmed up")
        else:
            print("Model not available")
    except Exception as e:
        print("Warmup failed:", e)


def create_app() -> Flask:
    cfg = get_config()

    app = Flask(__name__)
    app.config["SECRET_KEY"] = cfg.SECRET_KEY
    app.config["MAX_CONTENT_LENGTH"] = cfg.MAX_CONTENT_LENGTH

    # CORS
    CORS(app, resources={r"/api/*": {
        "origins": [
            "http://localhost:5173", 
            "http://localhost:5174", 
            "http://127.0.0.1:5173", 
            "http://127.0.0.1:5174"
        ],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    }})

    # Routes
    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(predict_bp, url_prefix="/api")
    app.register_blueprint(weather_bp, url_prefix="/api/weather")
    app.register_blueprint(risk_bp, url_prefix="/api/risk")
    app.register_blueprint(schemes_bp, url_prefix="/api/schemes")

    # 🔥 IMPORTANT: Chatbot route (your AI system)
    app.register_blueprint(chatbot_bp, url_prefix="/api/chatbot")

    # File serving
    @app.route("/uploads/<path:filename>", methods=["GET"])
    def serve_upload(filename):
        return send_from_directory(os.path.abspath(cfg.UPLOAD_DIR), filename)

    # Health check
    @app.route("/", methods=["GET"])
    def health():
        return jsonify({
            "status": "healthy",
            "service": "AgroGuardian AI Backend",
            "version": "FINAL AI VERSION"
        })

    # Error handlers
    @app.errorhandler(400)
    def bad_request(e):
        return jsonify({"success": False, "error": "Bad Request", "message": str(e)}), 400

    @app.errorhandler(404)
    def not_found(e):
        return jsonify({"success": False, "error": "Not Found"}), 404

    @app.errorhandler(413)
    def too_large(e):
        return jsonify({"success": False, "error": "Payload Too Large"}), 413

    @app.errorhandler(500)
    def server_error(e):
        log.error(f"❌ 500 ERROR: {str(e)}")
        return jsonify({"success": False, "error": "Internal Server Error"}), 500

    # Init DB + folders
    with app.app_context():
        try:
            os.makedirs(cfg.UPLOAD_DIR, exist_ok=True)
            os.makedirs(cfg.ML_MODELS_DIR, exist_ok=True)

            init_indexes()
            seed_schemes()

            log.info("✅ DB initialized")

        except Exception as e:
            log.warning(f"⚠️ Init skipped: {str(e)}")

    return app


app = create_app()


if __name__ == "__main__":
    cfg = get_config()
    log.info(f"🚀 Starting on port {cfg.PORT}")
    app.run(host="0.0.0.0", port=cfg.PORT, debug=cfg.DEBUG)