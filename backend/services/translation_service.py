"""
AgroGuardian AI — Translation Service (Improved)
Supports full text translation for chatbot + API responses
"""

from utils.logger import get_logger
from config import get_config

log = get_logger("service.translation")
cfg = get_config()


# ══════════════════════════════════════════════════════════════════════
# LOCAL DICTIONARY (fallback only)
# ══════════════════════════════════════════════════════════════════════

TRANSLATIONS = {
    "hi": {
        "Low": "कम",
        "Medium": "मध्यम",
        "High": "उच्च",
        "Critical": "गंभीर",
        "Healthy": "स्वस्थ",
        # Pests
        "Fall Armyworm (Spodoptera frugiperda)": "फॉल आर्मीवॉर्म (स्पोडोप्टेरा फ्रुगिपरदा)",
        "Mango Hopper (Idioscopus clypealis)": "आम का हॉपर (इडियोस्कोपस क्लिपेयलिस)",
        "Yellow Stem Borer (Scirpophaga incertulas)": "पीला तना छेदक (सिर्पोफागा इंसर्टुलस)",
        "Potato Tuber Moth (Phthorimaea operculella)": "आलू कंद कीट (फ्थोरिमिया ऑपरकुलेला)",
        "Tomato Fruit Borer (Helicoverpa armigera)": "टमाटर फल छेदक (हेलिकोवर्पा आर्मिगेरा)",
        "Grape Thrips (Rhipiphorothrips cruentatus)": "अंगूर के थ्रिप्स (रिफ़िफ़ोरोथ्रिप्स क्रुएन्टैटस)",
        "Codling Moth (Cydia pomonella)": "कॉडलिंग मोथ (सिडिया पोमोनेला)",
        # Pathogens
        "Apple Scab (Venturia inaequalis)": "सेब का पपड़ी रोग (वेंचुरिया इनैक्वालिस)",
        "Fire Blight (Erwinia amylovora)": "अग्नि अंगमारी (इरविनिया एमाइलोवोरा)",
        "Apple Scab": "सेब का पपड़ी रोग",
        "Fire Blight": "अग्नि अंगमारी",
        "Corn Common Rust (Puccinia sorghi)": "मक्के का सामान्य गेरुआ रोग (पुक्सिनिया सोरघी)",
        "Grape Downy Mildew (Plasmopara viticola)": "अंगूर का डाउनी मिल्ड्यू (प्लास्मोपारा विटिकोला)",
        "Grape Powdery Mildew (Uncinula necator)": "अंगूर का पाउडरयुक्त फफूंदी (अनसिनुला नेकेटर)",
        "Grape Powdery Mildew": "अंगूर का पाउडरयुक्त फफूंदी",
        "Mango Anthracnose (Colletotrichum gloeosporioides)": "आम का एन्थ्रेक्नोज (कोलेटोट्रिचम ग्लोयोस्पोरियोइड्स)",
        # Crops
        "Apple": "सेब",
        "Grape": "अंगूर",
        "Grapes": "अंगूर",
        # Suitability & Schedule
        "Highly Optimal": "अत्यंत अनुकूल",
        "Marginally Acceptable": "मामूली रूप से स्वीकार्य",
        "Not Recommended": "अनुशंसित नहीं",
        "Restricted: Suspended due to wind": "प्रतिबंधित: हवा के कारण निलंबित",
        "Tomorrow 6:00 AM – 8:00 AM": "कल सुबह 6:00 बजे – 8:00 बजे",
        "Tomorrow 7:00 AM – 9:00 AM": "कल सुबह 7:00 बजे – 9:00 बजे",
    },
    "kn": {
        "Low": "ಕಡಿಮೆ",
        "Medium": "ಮಧ್ಯಮ",
        "High": "ಹೆಚ್ಚು",
        "Critical": "ಗಂಭೀರ",
        "Healthy": "ಆರೋಗ್ಯಕರ",
        # Pests
        "Fall Armyworm (Spodoptera frugiperda)": "ಫಾಲ್ ಆರ್ಮಿವರ್ಮ್ (ಸ್ಪೊಡೋಪ್ಟೆರಾ ಫ್ರುಗಿಪರ್ಡಾ)",
        "Mango Hopper (Idioscopus clypealis)": "ಮಾವಿನ ಜಿಗಿಹುಳು (ಇಡಿಯೋಸ್ಕೋಪಸ್ ಕ್ಲೈಪಿಯಾಲಿಸ್)",
        "Yellow Stem Borer (Scirpophaga incertulas)": "ಹಳದಿ ಕಾಂಡ ಕೊರಕ (ಸ್ಕಿರ್ಪೋಫಾಗಾ ಇನ್ಸರ್ಟುಲಾಸ್)",
        "Potato Tuber Moth (Phthorimaea operculella)": "ಆಲೂಗಡ್ಡೆ ಗೆಡ್ಡೆ ಪತಂಗ (ಫ್ಥೋರಿಮಿಯಾ ಒಪೆರ್ಕ್ಯುಲೆಲ್ಲಾ)",
        "Tomato Fruit Borer (Helicoverpa armigera)": "ಟೊಮೆಟೊ ಹಣ್ಣು ಕೊರಕ (ಹೆಲಿಕೋವರ್ಪಾ ಆರ್ಮಿ ಗೆರಾ)",
        "Grape Thrips (Rhipiphorothrips cruentatus)": "ದ್ರಾಕ್ಷಿ ನುಸಿ (ರೈಪಿಫೊರೊಥ್ರಿಪ್ಸ್ ಕ್ರೂಯೆಂಟಾಟಸ್)",
        "Codling Moth (Cydia pomonella)": "ಕಾಡ್ಲಿಂಗ್ ಪತಂಗ (ಸೈಡಿಯಾ ಪೊಮೊನೆಲ್ಲಾ)",
        # Pathogens
        "Apple Scab (Venturia inaequalis)": "ಸೇಬು ಸ್ಕ್ಯಾಬ್ (ವೆಂಚುರಿಯಾ ಇನೇಕ್ವಾಲಿಸ್)",
        "Fire Blight (Erwinia amylovora)": "ಅಗ್ನಿ ಅಂಗಮಾರಿ ರೋಗ (ಇರ್ವಿನಿಯಾ ಅಮೈಲೋವೋರಾ)",
        "Apple Scab": "ಸೇಬು ಸ್ಕ್ಯಾಬ್",
        "Fire Blight": "ಅಗ್ನಿ ಅಂಗಮಾರಿ",
        "Corn Common Rust (Puccinia sorghi)": "ಮೆಕ್ಕೆಜೋಳದ ಸಾಮಾನ್ಯ ತುಕ್ಕು ರೋಗ (ಪುಕ್ಸಿನಿಯಾ ಸೋರ್ಘಿ)",
        "Grape Downy Mildew (Plasmopara viticola)": "ದ್ರಾಕ್ಷಿ ಡೌನಿ ಮಿಲ್ಡ್ಯೂ (ಪ್ಲಾಸ್ಮೋಪರಾ ವಿಟಿಕೋಲಾ)",
        "Grape Powdery Mildew (Uncinula necator)": "ದ್ರಾಕ್ಷಿ ಪುಡಿ ಬೂಷ್ಟು ರೋಗ (ಅನ್ಸಿನುಲಾ ನೆಕೇಟರ್)",
        "Grape Powdery Mildew": "ದ್ರಾಕ್ಷಿ ಪುಡಿ ಬೂಷ್ಟು",
        "Mango Anthracnose (Colletotrichum gloeosporioides)": "ಮಾವಿನ ಆಂಥ್ರಾಕ್ನೋಸ್ (ಕೊಲೆಟೊಟ್ರಿಚಮ್ ಗ್ಲೋಯೊಸ್ಪೊರಿಯೊಯಿಡ್ಸ್)",
        # Crops
        "Apple": "ಸೇಬು",
        "Grape": "ದ್ರಾಕ್ಷಿ",
        "Grapes": "ದ್ರಾಕ್ಷಿ",
        # Suitability & Schedule
        "Highly Optimal": "ಹೆಚ್ಚು ಸೂಕ್ತವಾಗಿದೆ",
        "Marginally Acceptable": "ಸ್ವಲ್ಪ ಮಟ್ಟಿಗೆ ಸ್ವೀಕಾರಾರ್ಹ",
        "Not Recommended": "ಶಿಫಾರಸು ಮಾಡಲಾಗಿಲ್ಲ",
        "Restricted: Suspended due to wind": "ನಿರ್ಬಂಧಿಸಲಾಗಿದೆ: ಗಾಳಿಯ कारण ಅಮಾನತು",
        "Tomorrow 6:00 AM – 8:00 AM": "ನಾಳೆ ಬೆಳಗ್ಗೆ 6:00 – 8:00",
        "Tomorrow 7:00 AM – 9:00 AM": "ನಾಳೆ ಬೆಳಗ್ಗೆ 7:00 – 9:00",
    },
}


# ══════════════════════════════════════════════════════════════════════
# MAIN TRANSLATION FUNCTION
# ══════════════════════════════════════════════════════════════════════

def _gemini_translate(text: str, target_lang: str) -> str:
    """Uses Gemini API to perform robust language translation as fallback"""
    try:
        import google.generativeai as genai
        import os
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            return None
        genai.configure(api_key=api_key)
        lang_names = {"hi": "Hindi", "kn": "Kannada"}
        target_lang_name = lang_names.get(target_lang.lower(), target_lang)
        prompt = f"""You are a professional agricultural translator. Translate the following text into {target_lang_name}. Do NOT add any introductory or extra text, just return the exact translated text. Keep the translation professional, clean, and easy for local farmers to understand.

Text: {text}"""
        model = genai.GenerativeModel("gemini-2.5-flash")
        response = model.generate_content(prompt, request_options={"timeout": 10.0})
        return response.text.strip()
    except Exception as e:
        log.warning(f"Gemini translate failed: {e}")
        return None

def translate_text(text: str, target_lang: str) -> str:
    """Translate full text (used for chatbot responses)"""

    if not text or target_lang == "en":
        return text

    # 🔥 1. Try Google Translate (best)
    if getattr(cfg, "GOOGLE_TRANSLATE_API_KEY", None):
        try:
            return _google_translate(text, target_lang)
        except Exception as e:
            log.warning(f"Google translate failed: {e}")

    # 🔥 2. Try Gemini translation fallback
    gemini_result = _gemini_translate(text, target_lang)
    if gemini_result:
        return gemini_result

    # 🔥 3. Fallback (basic word replace)
    return _local_translate(text, target_lang)


# ══════════════════════════════════════════════════════════════════════
# GOOGLE TRANSLATE API
# ══════════════════════════════════════════════════════════════════════

def _google_translate(text: str, target_lang: str) -> str:
    import requests

    url = "https://translation.googleapis.com/language/translate/v2"

    payload = {
        "q": text,
        "target": target_lang,
        "key": cfg.GOOGLE_TRANSLATE_API_KEY,
    }

    response = requests.post(url, params=payload, timeout=5)
    response.raise_for_status()

    return response.json()["data"]["translations"][0]["translatedText"]


# ══════════════════════════════════════════════════════════════════════
# LOCAL FALLBACK
# ══════════════════════════════════════════════════════════════════════

def _local_translate(text: str, target_lang: str) -> str:
    lang_dict = TRANSLATIONS.get(target_lang, {})

    result = text
    for en, tr in lang_dict.items():
        result = result.replace(en, tr)

    return result


# ══════════════════════════════════════════════════════════════════════
# TRANSLATE CHATBOT RESPONSE
# ══════════════════════════════════════════════════════════════════════

def translate_chatbot_response(response: dict, target_lang: str) -> dict:
    """
    Translate chatbot response (FULL TEXT, not just keywords)
    """

    if target_lang == "en":
        return response

    try:
        translated = dict(response)

        if "response" in translated:
            translated["response"] = translate_text(
                translated["response"], target_lang
            )

        translated["language"] = target_lang

        return translated

    except Exception as e:
        log.error(f"Translation failed: {e}")
        return response


# ══════════════════════════════════════════════════════════════════════
# GENERIC API RESPONSE TRANSLATION (optional)
# ══════════════════════════════════════════════════════════════════════

def translate_response(data: dict, target_lang: str) -> dict:
    """For non-chatbot APIs"""

    if target_lang == "en":
        return data

    translated = dict(data)

    for key, value in translated.items():
        if isinstance(value, str):
            translated[key] = translate_text(value, target_lang)

    return translated