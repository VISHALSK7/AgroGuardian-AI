import os
from dotenv import load_dotenv
import google.generativeai as genai
import time

load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

models_to_test = [
    "gemini-2.5-flash",
    "gemini-flash-latest",
    "gemini-3.5-flash",
    "gemini-2.0-flash",
    "gemini-2.5-flash-lite",
    "gemini-3.1-flash-lite"
]

working_models = []

for m in models_to_test:
    print(f"Testing {m}...")
    try:
        model = genai.GenerativeModel(m)
        response = model.generate_content("Say 'hello'")
        print(f"  SUCCESS! Response: {response.text}")
        working_models.append(m)
        break # stop on first success
    except Exception as e:
        msg = str(e)
        if "429" in msg:
            print("  FAILED: 429 Quota Exceeded (Limit might be 0)")
        elif "404" in msg:
            print("  FAILED: 404 Not Found")
        else:
            print(f"  FAILED: {msg}")
    time.sleep(1)

print("\nWorking models:", working_models)
