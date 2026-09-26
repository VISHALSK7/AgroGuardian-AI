import os
from dotenv import load_dotenv
import google.generativeai as genai

load_dotenv()
key = os.getenv("GEMINI_API_KEY")
print("Key length:", len(key))
genai.configure(api_key=key)

for model_name in ["gemini-1.5-flash", "gemini-2.0-flash", "gemini-pro"]:
    print(f"\nTesting {model_name}...")
    try:
        model = genai.GenerativeModel(model_name)
        response = model.generate_content("Hi")
        print("Success!", response.text)
        break
    except Exception as e:
        print("Error:", e)
