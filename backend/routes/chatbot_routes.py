"""
AgroGuardian AI — Chatbot Routes (FINAL PRODUCTION VERSION)
"""

from flask import Blueprint
import controllers.chatbot_controller as chatbot_controller

# 🔥 CLEAN BLUEPRINT (no prefix here — handled in app.py)
chatbot_bp = Blueprint("chatbot", __name__)


# =========================================
# 🧠 TEXT CHAT (AI Conversation)
# =========================================
# POST /chat/
@chatbot_bp.route("/", methods=["POST"])
def chat():
    return chatbot_controller.handle_chat()


# =========================================
# 📜 CHAT HISTORY
# =========================================
# GET /chat/history?session_id=xxx
@chatbot_bp.route("/history", methods=["GET"])
def history():
    return chatbot_controller.get_history()


# =========================================
# 🌿 IMAGE DISEASE DETECTION (MAIN FEATURE)
# =========================================
# POST /chat/image
@chatbot_bp.route("/image", methods=["POST"])
def chat_image():
    return chatbot_controller.handle_chat_image()


# =========================================
# ATTACHED FILE ANALYSIS
# =========================================
# POST /chat/file
@chatbot_bp.route("/file", methods=["POST"])
def chat_file():
    return chatbot_controller.handle_chat_file()


# =========================================
# MULTILINGUAL VOICE OUTPUT
# =========================================
# POST /chat/tts
@chatbot_bp.route("/tts", methods=["POST"])
def chat_tts():
    return chatbot_controller.handle_tts()


# POST /chat/translate
@chatbot_bp.route("/translate", methods=["POST"])
def chat_translate():
    return chatbot_controller.handle_translate()

