import sys
import os
sys.path.append(os.path.dirname(__file__))

from services.chatbot_service import chat
from dotenv import load_dotenv

load_dotenv()
response = chat("Hello", "en", "test_session", "test_user")
print("Response:", response)
