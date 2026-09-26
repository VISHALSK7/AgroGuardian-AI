import os
from dotenv import load_dotenv

load_dotenv()

# 🔥 SAFE CLIENT INIT
gemini_api_key = os.getenv("GEMINI_API_KEY")
openai_api_key = os.getenv("OPENAI_API_KEY")

# Initialize OpenAI client only if key exists, otherwise None
client = None
if openai_api_key:
    from openai import OpenAI
    try:
        client = OpenAI(api_key=openai_api_key)
    except Exception as e:
        print("⚠️ Failed to initialize OpenAI client in nlp_engine:", e)

# Initialize Gemini if key exists
has_gemini = False
if gemini_api_key:
    try:
        import google.generativeai as genai
        genai.configure(api_key=gemini_api_key)
        has_gemini = True
        print("[nlp_engine] Gemini successfully configured.")
    except Exception as e:
        print("⚠️ Failed to configure Gemini in nlp_engine:", e)

GREETINGS = [
    "hi",
    "hello",
    "hey",
    "namaste",
    "ನಮಸ್ಕಾರ",
    "हेलो"
]

WEBSITE_KEYWORDS = [
    "dashboard",
    "weather",
    "upload",
    "report",
    "history",
    "profile",
    "chatbot",
    "settings",
    "voice",
    "login",
    "signup"
]

AGRI_KEYWORDS = [
    "crop",
    "soil",
    "fertilizer",
    "disease",
    "farming",
    "yield",
    "pest",
    "weather",
    "seed",
    "irrigation"
]

def detect_intent(text):
    lower = text.lower().strip()

    if lower in GREETINGS:
        return "greeting"

    for word in WEBSITE_KEYWORDS:
        if word in lower:
            return "website_support"

    for word in AGRI_KEYWORDS:
        if word in lower:
            return "agriculture"

    return "off_topic"


# 🔥 CLEAN LANGUAGE MAPPING
def normalize_language(lang):
    lang = lang.lower()
    if lang in ["en", "english"]:
        return "English"
    elif lang in ["hi", "hindi"]:
        return "Hindi"
    elif lang in ["kn", "kannada"]:
        return "Kannada"
    else:
        return "English"


# 🔥 MAIN FUNCTION
def generate_disease_explanation(disease_name, language="english"):
    try:
        language = normalize_language(language)

        # 🔥 OPTIMIZED PROMPT
        prompt = f"""
You are an expert agricultural assistant helping farmers.

Explain the crop disease: "{disease_name}"

Respond strictly in {language}.

Make the answer simple, practical, and easy to understand.

Format:
1. What is this disease?
2. Causes
3. Treatment (step-by-step)
4. Prevention tips

Avoid technical jargon.
"""

        answer = None

        # ── Try Gemini first ──────────────────────────────────────────────────────
        if has_gemini:
            try:
                import google.generativeai as genai
                model_name = "gemini-2.5-flash" # Hardcoded to bypass os.environ caching
                print(f"[nlp_engine] Generating disease explanation using Gemini model: {model_name}")
                model = genai.GenerativeModel(
                    model_name=model_name,
                    system_instruction="You are a helpful agriculture expert."
                )
                response = model.generate_content(
                    prompt,
                    generation_config=genai.GenerationConfig(
                        temperature=0.5,
                        max_output_tokens=2048,
                    ),
                )
                answer = response.text.strip()
                print("[nlp_engine] Gemini explanation generated successfully.")
            except Exception as gemini_err:
                print(f"🔥 Gemini NLP Error in nlp_engine: {gemini_err}. Trying OpenAI fallback...")

        # ── Try OpenAI fallback if Gemini didn't work ──────────────────────────────
        if not answer and client:
            try:
                print("[nlp_engine] Generating disease explanation using OpenAI fallback...")
                response = client.chat.completions.create(
                    model=os.getenv("OPENAI_MODEL", "gpt-4o-mini"),
                    messages=[
                        {"role": "system", "content": "You are a helpful agriculture expert."},
                        {"role": "user", "content": prompt}
                    ],
                    temperature=0.5,
                    max_tokens=2048
                )
                answer = response.choices[0].message.content.strip()
                print("[nlp_engine] OpenAI fallback explanation generated successfully.")
            except Exception as openai_err:
                print(f"🔥 OpenAI NLP Error in nlp_engine: {openai_err}")

        # 🔥 BASIC VALIDATION
        if not answer or len(answer) < 20:
            raise ValueError("Empty or weak response from AI models")

        return answer

    except Exception as e:
        print("🔥 NLP ERROR:", str(e))

        # 🔥 SMART FALLBACK (IMPORTANT)
        fallback = f"""
Disease detected: {disease_name}

Basic Advice:
- This is a plant disease affecting crops.
- Remove infected leaves immediately.
- Use appropriate fungicide/pesticide.
- Maintain proper plant hygiene.

(Full AI explanation unavailable at the moment)
"""
        return fallback.strip()