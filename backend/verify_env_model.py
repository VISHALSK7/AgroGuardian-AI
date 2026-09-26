import os
from dotenv import load_dotenv
import google.generativeai as genai

load_dotenv()
model_name = os.getenv("GEMINI_MODEL")
key = os.getenv("GEMINI_API_KEY")

print(f"Loaded model from .env: {model_name}")
print(f"Key length: {len(key)}")

genai.configure(api_key=key)
try:
    model = genai.GenerativeModel(model_name)
    response = model.generate_content("Say hi")
    print(f"SUCCESS: {response.text}")
except Exception as e:
    print(f"ERROR: {str(e)}")
