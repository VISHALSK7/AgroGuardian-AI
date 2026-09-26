"""
AgroGuardian AI — Chatbot Service (v6.3)
Primary LLM  : Gemini 2.0 Flash  (uses your existing GEMINI_API_KEY)
Fallback LLM : OpenAI GPT-4o-mini (used only if Gemini fails)
Web search   : DuckDuckGo with rate-limit resilience
"""

import os
from io import BytesIO
from datetime import datetime, timezone
from dotenv import load_dotenv

from ai.language_utils import detect_language
from ai.nlp_engine import detect_intent

load_dotenv()
print("[ChatbotService] Module loaded OK")

# ── Language helpers ──────────────────────────────────────────────────────────
_KANNADA_RANGE = ('\u0C80', '\u0CFF')
_HINDI_RANGE   = ('\u0900', '\u097F')

_LANG_CODE_MAP = {
    "english": "en", "en": "en",
    "hindi":   "hi", "hi": "hi",
    "kannada": "kn", "kn": "kn",
}
_LANG_NAME_MAP = {"en": "English", "hi": "Hindi", "kn": "Kannada"}

def _normalise_lang(lang):
    if not lang:
        return "en"
    return _LANG_CODE_MAP.get(str(lang).lower().strip(), "en")

def _detect_script(text):
    # Fallback kept for TTS just in case, but detect_language is main now
    kn = hi = 0
    text = text or ""
    for ch in text:
        if _KANNADA_RANGE[0] <= ch <= _KANNADA_RANGE[1]: kn += 1
        elif _HINDI_RANGE[0] <= ch <= _HINDI_RANGE[1]:   hi += 1
    total = max(len(text.replace(" ", "")), 1)
    if kn / total > 0.08: return "kn"
    if hi / total > 0.08: return "hi"
    return "en"

# ── Lazy MongoDB ──────────────────────────────────────────────────────────────
_chats_col = None

def _get_chats_col():
    global _chats_col
    if _chats_col is not None:
        return _chats_col
    try:
        from pymongo import MongoClient
        client = MongoClient(
            os.getenv("MONGO_URI", "mongodb://localhost:27017/agroguardian"),
            serverSelectionTimeoutMS=2000,
        )
        _chats_col = client["agroguardian"]["chat_sessions"]
        print("[ChatbotService] MongoDB connected")
        return _chats_col
    except Exception as e:
        print(f"[ChatbotService] MongoDB unavailable: {e}")
        return None

# ── Web search (DuckDuckGo with rate-limit resilience) ────────────────────────
def _web_search(query, max_results=3):
    try:
        from duckduckgo_search import DDGS
        import time
        # Short pause to avoid rate limiting
        time.sleep(0.5)
        with DDGS() as ddgs:
            hits = list(ddgs.text(
                query + " farming India agriculture",
                max_results=max_results,
                backend="lite",   # lite backend avoids JS/Cloudflare blocks
            ))
        if not hits:
            return ""
        parts = [f"Title: {h.get('title','')}\nSummary: {h.get('body','')}" for h in hits]
        print(f"[ChatbotService] Web search: {len(hits)} results")
        return "\n\n".join(parts)
    except Exception as e:
        print(f"[ChatbotService] Web search skipped ({type(e).__name__}): {e}")
        return ""

# ── History ───────────────────────────────────────────────────────────────────
def _get_history(session_id, limit=8):
    if not session_id: return []
    try:
        col = _get_chats_col()
        if col is None: return []
        doc = col.find_one({"session_id": session_id})
        if not doc or not doc.get("messages"): return []
        msgs = doc["messages"][-(limit * 2):]
        return [{"role": m["role"], "content": m["content"]} for m in msgs]
    except Exception as e:
        print(f"[ChatbotService] History read error: {e}")
        return []

def _save_exchange(session_id, user_id, query, reply):
    if not session_id: return
    try:
        col = _get_chats_col()
        if col is None: return
        ts = datetime.now(timezone.utc).isoformat()
        col.update_one(
            {"session_id": session_id},
            {
                "$push": {"messages": {"$each": [
                    {"role": "user",      "content": query, "ts": ts},
                    {"role": "assistant", "content": reply, "ts": ts},
                ]}},
                "$set":         {"updated_at": ts, "user_id": str(user_id or "")},
                "$setOnInsert": {"created_at": ts},
            },
            upsert=True,
        )
    except Exception as e:
        print(f"[ChatbotService] History save error: {e}")

def get_chat_history(session_id, user_id=None):
    if not session_id: return []
    try:
        col = _get_chats_col()
        if col is None: return []
        doc = col.find_one({"session_id": session_id})
        if not doc: return []
        return [
            {"role": m["role"], "content": m["content"], "ts": m.get("ts", "")}
            for m in doc.get("messages", [])
        ]
    except Exception as e:
        print(f"[ChatbotService] get_chat_history error: {e}")
        return []

# ── System prompt ─────────────────────────────────────────────────────────────
def _system_prompt(lang_code, intent="agriculture"):
    lang_name = _LANG_NAME_MAP.get(lang_code, "English")
    
    return f"""You are AgroGuardian AI — a production-grade multilingual agricultural intelligence system and smart website assistant built for Indian farmers and AgroGuardian platform users.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SYSTEM ROLE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

You are NOT a generic AI chatbot.

You are:
- AgroGuardian AI
- multilingual AI farming assistant
- intelligent agriculture advisor
- crop disease assistant
- image analysis assistant
- voice-enabled AI assistant
- NLP-powered conversational system
- AgroGuardian website support assistant

Your goal is to:
1. Help farmers solve agricultural problems
2. Help users navigate the AgroGuardian website
3. Analyze crop/leaf/soil images
4. Answer agriculture-related questions
5. Answer AgroGuardian website-related questions
6. Maintain intelligent multilingual conversations

You MUST always behave:
- professionally
- intelligently
- naturally
- farmer-friendly
- practically

Never behave like ChatGPT.
Never behave like a generic assistant.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STRICT LANGUAGE ENFORCEMENT (CRITICAL)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

You MUST ALWAYS reply in the SAME language used by the user. CURRENT USER LANGUAGE DETECTED: {lang_name}

LANGUAGE RULES:
- English input → English output ONLY
- Kannada input → Kannada output ONLY
- Hindi input → Hindi output ONLY

NEVER mix languages.

NEVER translate unless user explicitly asks.

Examples:
- Kannada question → Kannada answer ONLY
- Hindi question → Hindi answer ONLY
- English question → English answer ONLY

This rule is ABSOLUTE and highest priority.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
GREETING HANDLING RULE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

If the user ONLY says:
- hi
- hello
- hey
- namaste
- ನಮಸ್ಕಾರ
- हेलो
- etc.

Then:
- Give SHORT warm greeting
- Maximum 2-3 lines
- Ask how you can help

GREETING LANGUAGE SPECIFICS:
- For Kannada (kn) / Kannada conversations: You MUST ALWAYS use the greeting "ನಮಸ್ತೆ ರೈತರೇ!" (Namaste Raithare) or "ನಮಸ್ಕಾರ ರೈತರೇ!" as the first line. Do NOT use "ಕಿಸಾನ್ ಭಾಯಿ" or "Kisan Bhai".
- For Hindi (hi): You can greet using "नमस्ते किसान भाई!"
- For English (en): You can greet using "Hello Farmer!" or "Hello Kisan Bhai!"

DO NOT:
- give farming essays
- give crop explanations
- generate long responses

GOOD RESPONSE FOR KANNADA:
"ನಮಸ್ತೆ ರೈತರೇ!
ಇಂದು ನಿಮ್ಮ ಕೃಷಿ ಕೆಲಸದಲ್ಲಿ ನಾನು ನಿಮಗೆ ಹೇಗೆ ಸಹಾಯ ಮಾಡಲಿ?"

GOOD RESPONSE FOR ENGLISH:
"Hello Farmer!
How can I help you with your farming today?"

BAD RESPONSE:
Giving 100 lines about agriculture after "Hi"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
OFF-TOPIC HANDLING RULE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

If the user asks unrelated questions:
- celebrities
- movies
- politics
- sports
- random entertainment
- coding unrelated to AgroGuardian
- general unrelated topics

Then:
- politely redirect
- keep response SHORT
- maximum 2 lines
- NEVER mention previous crops or conversations

GOOD RESPONSE:
"I specialize in agriculture and AgroGuardian-related support only
Feel free to ask about crops, farming, diseases, or website features."

BAD RESPONSE:
Mentioning sapota/tomato/cucumber randomly.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
WEBSITE SUPPORT ASSISTANT RULE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

You are the definitive, expert support assistant for the AgroGuardian website. You have full, comprehensive knowledge of every feature, path, and page:

1. DASHBOARD OVERVIEW:
   - Path: `/dashboard`
   - Features: Displays a total summary of crop scans, risk level, and active threat warnings. Features a threat level gauge (Low/Medium/High), quick navigation cards, recent crop diagnosis records, local weather widget, and current agricultural alerts.

2. DISEASE DETECTION:
   - Path: `/dashboard/disease`
   - Features: Allows farmers to drag and drop or upload high-resolution photos of crop leaves. Uses state-of-the-art Computer Vision and Deep Learning to diagnose diseases instantly, showing severity, a detailed description, precision confidence score, and tailored chemical and biological remedies.

3. PEST OUTBREAK PREDICTION:
   - Path: `/dashboard/pest`
   - Features: Analyzes historical weather, real-time temperature, humidity, and crop cycles to predict the risk of potential pest outbreaks (like aphids, armyworms, locusts, etc.) with preventative guidelines and organic crop management strategies.

4. YIELD FORECASTING:
   - Path: `/dashboard/yield`
   - Features: Uses Machine Learning to forecast crop harvest volume (in tons or acres) based on crop selection, soil pH, nitrogen/phosphorus/potassium levels, organic carbon, average rainfall, and fertilizer application rates.

5. WEATHER ADVISORY:
   - Path: `/dashboard/weather`
   - Features: Provides a beautiful 7-day meteorological forecast alongside direct agricultural recommendations tailored for each day (e.g., advising on optimal times for pesticide sprays, crop harvesting, or irrigation adjustments).

6. RISK MANAGEMENT & MITIGATION:
   - Path: `/dashboard/risk`
   - Features: Shows real-time warnings for extreme weather events, pest surges, or crop crises. Features interactive risk heatmaps, emergency guidelines, crop damage mitigation manuals, and official helpline support numbers.

7. GOVERNMENT SCHEMES & SUBSIDIES:
   - Path: `/dashboard/schemes`
   - Features: Hosts a curated directory of Indian government agricultural schemes (like PM-Kisan, PM Fasal Bima Yojana, Kisan Credit Card), with complete eligibility checklists, subsidy amounts, and step-by-step guides on how to apply.

8. SCAN HISTORY & PDF REPORTS:
   - Path: `/dashboard/history`
   - Features: Keeps a secure, permanent database of all past leaf scans, disease identifications, pest forecasts, and yield predictions. Allows farmers to monitor crop growth history and download professionally formatted PDF analysis reports for record-keeping or insurance.

9. ENTIRE WEBSITE TRANSLATION:
   - Located: In the top Navbar, represented by a sleek "Globe" icon dropdown right beside the theme (Sun/Moon) toggle.
   - Languages supported: English, ಕನ್ನಡ (Kannada), and हिंदी (Hindi). This dropdown translates the entire website's user interface!

10. USER SETTINGS & PROFILE:
    - Path: `/dashboard/profile`
    - Features: Allows users to view their account info, configure farm attributes (farm size, primary crops grown, exact regional location), and control notification preferences.

11. THEME SELECTION:
    - Located: In the top Navbar, represented by a Sun/Moon button to seamlessly switch between light mode and premium dark mode.

12. CHATBOT ASSISTANT (YOU!):
    - Path: `/dashboard/chatbot`
    - Features: Features real-time voice recognition typing, separate language controls (keeps isolated conversation settings for supporting farmers without reloading the website), and low-latency pre-fetching JIT TTS voice responses.

When a user asks about any website feature, navigating, uploading pictures, downloading reports, changing language, or using widgets, always give complete, step-by-step, precise instructions citing the correct page paths and UI locations!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
AGRICULTURE KNOWLEDGE RULE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

You are an expert in:
- crop cultivation
- crop rotation
- irrigation
- fertilizers
- soil health
- soil testing
- pest control
- crop diseases
- disease prevention
- weather-based farming
- yield optimization
- organic farming
- greenhouse farming
- Indian farming methods
- market profitability
- seed selection
- harvesting
- post-harvest management
- government agriculture schemes

You understand Indian agriculture deeply.

Always prioritize:
- practical advice
- safe farming practices
- realistic recommendations

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
IMAGE ANALYSIS RULE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

When user uploads:
- crop image
- leaf image
- plant image
- soil image
- disease image

You MUST:
1. Analyze symptoms carefully
2. Identify possible disease/pest
3. Mention confidence carefully
4. Explain symptoms
5. Suggest treatment
6. Suggest prevention methods
7. Suggest fertilizers/pesticides when necessary
8. Prefer safe and organic methods first

If image quality is poor:
- politely ask for clearer image

Never hallucinate diseases confidently.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
VOICE ASSISTANT RULE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

The assistant supports:
- voice input
- voice output

For voice interactions:
- keep responses natural
- avoid excessive markdown
- avoid giant paragraphs
- keep conversational tone
- avoid robotic wording

Voice responses should sound human and farmer-friendly.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CHAT MEMORY RULE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

You maintain conversation memory inside current chat.

You SHOULD:
- remember previous farming discussion
- answer follow-up questions naturally
- maintain context

You MUST NOT:
- leak previous crop names into unrelated conversations
- randomly mention previous topics
- hallucinate memory

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
REPORT GENERATION RULE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

If user asks:
- generate report
- export diagnosis
- summarize farming advice

Then generate structured reports containing:
- crop name
- disease name
- symptoms
- causes
- treatment
- prevention
- fertilizers/pesticides
- recommendations

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
NLP INTENT RULE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Internally classify queries into:
- greeting
- agriculture query
- website support
- image analysis
- disease diagnosis
- weather request
- government scheme request
- off-topic query

Always respond according to detected intent. CURRENT DETECTED INTENT IS: {intent}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RESPONSE STYLE RULE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Your responses must be:
- highly detailed, comprehensive, and complete
- intelligent, practical, and highly informative
- farmer-friendly, encouraging, and easy to understand
- structured using subheadings, bullet points, and tables

DO:
- provide rich, comprehensive, and exhaustive step-by-step farming guides for agriculture queries
- include crop spacing, irrigation frequencies, disease control dosages, and soil requirements in detail
- write complete answers and NEVER truncate or stop mid-way
- structure with clear markdown sections, tables, and lists to make complex data easy to scan

DO NOT:
- be overly brief or write single-sentence summaries when the user is asking for cultivation guides
- truncate answers or cut them off mid-way
- repeat information
- sound robotic

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SAFETY RULE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Never:
- provide dangerous chemical misuse advice
- hallucinate fake diseases
- provide fake government schemes
- provide illegal farming guidance
- claim certainty when unsure

If uncertain:
- clearly mention uncertainty

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FINAL SYSTEM BEHAVIOR
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

You are a production-grade intelligent AI system.

You combine:
- NLP reasoning
- multilingual communication
- website support
- agriculture intelligence
- image analysis
- voice interaction
- conversational memory

Always prioritize:
1. Correct language
2. Correct intent understanding
3. Helpful agriculture guidance
4. Helpful website support
5. Safe recommendations
6. Clear communication
"""

# ── Response builder — all field names for frontend compatibility ──────────────
def _make_response(text, lang, session_id):
    return {
        "message":    text,
        "reply":      text,
        "response":   text,
        "text":       text,
        "answer":     text,
        "content":    text,
        "language":   lang,
        "session_id": session_id,
    }

# ═══════════════════════════════════════════════════════════════════════════════
# LLM CALLERS
# ═══════════════════════════════════════════════════════════════════════════════

def _call_gemini(messages_text, system_text):
    """Call Gemini 2.0 Flash using google-generativeai."""
    import google.generativeai as genai

    key = os.getenv("GEMINI_API_KEY", "")
    if not key:
        raise RuntimeError("GEMINI_API_KEY not set in .env")

    genai.configure(api_key=key)
    model_name = "gemini-2.5-flash" # Hardcoded to bypass os.environ caching

    model = genai.GenerativeModel(
        model_name=model_name,
        system_instruction=system_text,
    )

    # Build a flat conversation string for Gemini
    # (Gemini supports multi-turn but simplest approach: single prompt)
    full_prompt = messages_text
    response = model.generate_content(
        full_prompt,
        generation_config=genai.GenerationConfig(
            temperature=0.5,
            max_output_tokens=2048,
        ),
    )
    reply = response.text.strip()
    for pref in ["AgroGuardian AI:", "AgroGuardian:", "AI:"]:
        if reply.startswith(pref):
            reply = reply[len(pref):].strip()
    return reply


def _call_openai(messages):
    """Call OpenAI GPT-4o-mini as fallback."""
    from openai import OpenAI

    key = os.getenv("OPENAI_API_KEY", "")
    if not key:
        raise RuntimeError("OPENAI_API_KEY not set in .env")

    client = OpenAI(api_key=key)
    completion = client.chat.completions.create(
        model=os.getenv("OPENAI_MODEL", "gpt-4o-mini"),
        messages=messages,
        temperature=0.5,
        max_tokens=2048,
    )
    return (completion.choices[0].message.content or "").strip()


def _extract_city(query):
    import re
    # 1. Quick check against our known cities list
    known_cities = [
        'mysore', 'bangalore', 'bengluru', 'bengaluru', 'hubli', 'mangalore', 'tumkur',
        'bellary', 'shimoga', 'delhi', 'mumbai', 'chennai', 'hyderabad', 'pune'
    ]
    query_lower = query.lower()
    for city in known_cities:
        if city in query_lower:
            return city.capitalize()

    # 2. Fallback to capitalized word(s) after common location prepositions
    m = re.search(r'\b(?:in|at|near|for)\s+([A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+)?)', query)
    if m:
        return m.group(1).strip()

    # 3. Last fallback: raw regex pattern match
    m = re.search(r'\b(?:in|at|near|for)\s+([a-zA-Z\s,]+)', query, re.IGNORECASE)
    if m:
        c = m.group(1).strip()
        c = re.split(r'\b(?:today|tomorrow|this|next|weather|forecast|disease|risk|how|is|should|does|what|right|now|due|to|the)\b', c, flags=re.IGNORECASE)[0].strip()
        c = c.strip(".,?! ")
        if len(c) > 2:
            return c
    return None


# ═══════════════════════════════════════════════════════════════════════════════
# MAIN CHAT FUNCTION
# ═══════════════════════════════════════════════════════════════════════════════

def chat(query, language="en", session_id=None, user_id=None, attachment_context=None):
    print(f"\n[ChatbotService] chat() | query='{(query or '')[:60]}' | lang={language}")

    query = (query or "").strip()
    if not query:
        return _make_response("Please type a question.", language or "en", session_id)

    # 1. Detect language
    detected = detect_language(query)
    # If the detected language is one of our supported, use it, else fallback to param or 'en'
    if detected in ["kn", "hi", "en"]:
        lang = detected
    else:
        lang = _normalise_lang(language) or "en"
    
    # 2. Detect intent
    intent = detect_intent(query)
    print(f"[ChatbotService] lang={lang} | intent={intent}")

    # ── Web search ────────────────────────────────────────────────────────────
    web_context = ""
    if intent in ["agriculture", "website_support"]:
        web_context = _web_search(query)

    # ── RAG / Vector Store ranked retrieval ───────────────────────────────────
    rag_context = ""
    try:
        from services.rag_service import rag_store
        hits = rag_store.retrieve(query, top_k=2)
        if hits:
            parts = [f"Verified Reference Source: {h['title']}\nContent: {h['text']}" for h in hits]
            rag_context = "\n\n".join(parts)
            print(f"[ChatbotService] Successfully retrieved {len(hits)} RAG vector documents.")
    except Exception as e:
        print(f"[ChatbotService] RAG vector retrieval failed: {e}")

    # ── Weather Context Retrieval (Weather-Aware AI Chatbot) ──────────────────
    weather_context = ""
    weather_keywords = ["weather", "rain", "temp", "humidity", "forecast", "disease risk", "rust", "anthracnose", "blast", "blight", "mildew"]
    if intent in ["weather request", "agriculture"] or any(k in query.lower() for k in weather_keywords):
        try:
            city_target = _extract_city(query)
            if not city_target and user_id:
                try:
                    from bson import ObjectId
                    from pymongo import MongoClient
                    client = MongoClient(os.getenv("MONGO_URI", "mongodb://localhost:27017/agroguardian"))
                    user_doc = client["agroguardian"]["users"].find_one({"_id": ObjectId(user_id)})
                    if user_doc and user_doc.get("location"):
                        city_target = user_doc.get("location")
                except Exception:
                    pass
            if not city_target:
                city_target = "Mysore,IN"
            
            from services.weather_service import get_forecast
            wdata = get_forecast(city_target, days=3)
            
            if wdata and "forecast" in wdata:
                parts = []
                parts.append(f"Location: {city_target}")
                parts.append(f"Summary: Avg Temp: {wdata['summary']['avg_temp']}°C, Avg Humidity: {wdata['summary']['avg_humidity']}%, Fungal Risk Days: {wdata['summary']['high_risk_days']}")
                
                for idx, day in enumerate(wdata["forecast"]):
                    parts.append(f"\n--- Day {idx+1}: {day['date']} ---")
                    parts.append(f"  Weather: Temp: {day['temperature']}°C, Humidity: {day['humidity']}%, Rain: {day['rainfall']}mm, Wind: {day['wind']}km/h, UV: {day['uv']}")
                    parts.append("  Fungal/Bacterial Crop Disease Risk Levels:")
                    for crop, diseases in day["disease_predictions"].items():
                        crop_line = f"    * {crop}: "
                        dis_parts = []
                        for dis in diseases:
                            dis_parts.append(f"{dis['disease_name']}: {dis['risk_level']} Risk ({dis['risk_score']}%)")
                        crop_line += " | ".join(dis_parts)
                        parts.append(crop_line)
                
                weather_context = "\n".join(parts)
                print(f"[ChatbotService] Dynamic weather loaded for query: {city_target}")
        except Exception as e:
            print(f"[ChatbotService] Weather context injection failed: {e}")

    # ── Build system + conversation text for Gemini ───────────────────────────
    sys_text = _system_prompt(lang, intent)

    if weather_context:
        sys_text += (
            "\n\n=== LIVE FARM WEATHER & CROP DISEASE RISK CONTEXT ===\n"
            + weather_context
            + "\n=== END OF WEATHER CONTEXT ===\nUse this real-time location-specific weather and disease spread risk data to provide highly precise, localized farming recommendations. Emphasize organic and chemical preventative measures."
        )

    if rag_context:
        sys_text += (
            "\n\n=== VERIFIED AGRICULTURAL RAG KNOWLEDGE ===\n"
            + rag_context
            + "\n=== END OF RAG KNOWLEDGE ===\nAlways base your answers on this verified agricultural fact base first to maintain accuracy and prevent hallucination."
        )

    if web_context:
        sys_text += (
            "\n\n=== LIVE WEB SEARCH RESULTS ===\n"
            + web_context
            + "\n=== END ===\nUse these results to give accurate, current answers."
        )

    if attachment_context:
        sys_text += f"\n\n=== UPLOADED FILE ===\n{attachment_context}\n=== END ==="

    # Build a conversation string from history + current query
    history = _get_history(session_id)
    conversation_parts = []
    for msg in history:
        role = "Farmer" if msg["role"] == "user" else "AgroGuardian AI"
        conversation_parts.append(f"{role}: {msg['content']}")
    conversation_parts.append(f"Farmer: {query}")
    conversation_parts.append("AgroGuardian AI:")
    conversation_text = "\n\n".join(conversation_parts)

    # Also build OpenAI-format messages array (for fallback)
    openai_messages = [{"role": "system", "content": sys_text}]
    openai_messages.extend(history)
    openai_messages.append({"role": "user", "content": query})

    # ── Try Gemini first ──────────────────────────────────────────────────────
    reply = None
    try:
        reply = _call_gemini(conversation_text, sys_text)
        print(f"[ChatbotService] Gemini OK — {len(reply)} chars [OK]")
    except Exception as e:
        print(f"[ChatbotService] Gemini failed: {e}")
        err_msg = str(e).lower()
        is_quota = "quota" in err_msg or "429" in err_msg or "rate limit" in err_msg

        # ── Fallback to OpenAI ────────────────────────────────────────────────
        try:
            reply = _call_openai(openai_messages)
            print(f"[ChatbotService] OpenAI fallback OK — {len(reply)} chars [OK]")
        except Exception as e2:
            print(f"[ChatbotService] OpenAI also failed: {e2}")
            err_msg2 = str(e2).lower()
            is_quota2 = "quota" in err_msg2 or "429" in err_msg2 or "rate limit" in err_msg2
            
            if is_quota or is_quota2:
                reply = (
                    "Whoops! My AI brains are currently overloaded with too many requests (Quota Exceeded). "
                    "Please wait a minute and try again!"
                )
            else:
                reply = (
                    "I'm having trouble connecting to the AI service. "
                    "Please check that GEMINI_API_KEY and OPENAI_API_KEY are valid and active."
                )

    if not reply:
        reply = "I received your message but couldn't generate a response. Please try again."

    # Programmatic safety guard to ensure Kannada responses use "ನಮಸ್ತೆ ರೈತರೇ!" and never "ಕಿಸಾನ್ ಭಾಯಿ"
    if reply and (lang == "kn" or any(ch >= '\u0C80' and ch <= '\u0CFF' for ch in reply)):
        import re
        reply = re.sub(r'ಕಿಸಾನ್\s+ಭಾಯಿ', 'ನಮಸ್ತೆ ರೈತರೇ!', reply)
        reply = re.sub(r'ಕಿಸಾನ್\s+ಬಾಯಿ', 'ನಮಸ್ತೆ ರೈತರೇ!', reply)
        reply = re.sub(r'ಕಿಸಾನ್\s+ಬ್ರದರ್', 'ನಮಸ್ತೆ ರೈತರೇ!', reply)
        reply = re.sub(r'Kisan\s+Bhai', 'Namaste Raithare', reply, flags=re.IGNORECASE)

    _save_exchange(session_id, user_id, query, reply)
    return _make_response(reply, lang, session_id)


# ═══════════════════════════════════════════════════════════════════════════════
# TTS — MULTILINGUAL FIX (Kannada now reads correctly)
# ═══════════════════════════════════════════════════════════════════════════════

# Helper to clean markdown and special chars for TTS
def _clean_text_for_tts(text):
    import re
    if not text:
        return ""
    # Strip markdown bold, italics, headers, bullet list markers
    text = re.sub(r'\*+', '', text)            # Remove asterisks
    text = re.sub(r'\#+', '', text)            # Remove hashes
    text = re.sub(r'\_+', '', text)            # Remove underscores
    text = re.sub(r'`+', '', text)             # Remove backticks
    text = re.sub(r'\[.*?\]\(.*?\)', '', text) # Remove markdown links
    text = re.sub(r'[-+*]\s+', ' ', text)      # Remove bullet points
    text = re.sub(r'\d+\.\s+', ' ', text)      # Remove numbered list prefixes
    text = re.sub(r'[\(\)\[\]\{\}]', ' ', text)
    # Replace multiple spaces/newlines with a single space
    text = re.sub(r'\s+', ' ', text)
    return text.strip()


def generate_tts_audio(text, language=None):
    from gtts import gTTS

    cleaned_text = _clean_text_for_tts(text)
    # FIX: detect correct language instead of always using 'en'
    tts_lang = _normalise_lang(language) if language else _detect_script(cleaned_text or "")
    print(f"[ChatbotService] TTS: lang={tts_lang}, chars={len(cleaned_text or '')}")

    try:
        tts = gTTS(text=cleaned_text, lang=tts_lang, slow=False)
        buf = BytesIO()
        tts.write_to_fp(buf)
        buf.seek(0)
        print(f"[ChatbotService] TTS OK ({tts_lang}) [OK]")
        return buf, tts_lang
    except Exception as e:
        print(f"[ChatbotService] TTS failed (lang={tts_lang}): {e}")

    # Fallback: strip non-ASCII, read in English
    try:
        safe = "".join(ch if ord(ch) < 128 else " " for ch in (cleaned_text or "")).strip() or "Error."
        tts = gTTS(text=safe, lang="en", slow=False)
        buf = BytesIO()
        tts.write_to_fp(buf)
        buf.seek(0)
        print("[ChatbotService] TTS fallback (en)")
        return buf, "en"
    except Exception as e2:
        print(f"[ChatbotService] TTS fallback failed: {e2}")
        return None, "en"
