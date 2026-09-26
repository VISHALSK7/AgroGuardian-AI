from deep_translator import GoogleTranslator
from langdetect import detect, DetectorFactory

DetectorFactory.seed = 0

SUPPORTED_LANGUAGES = {
    'en': 'english',
    'hi': 'hindi',
    'kn': 'kannada'
}

def detect_language(text):
    try:
        lang = detect(text)

        if lang == "kn":
            return "kn"

        if lang == "hi":
            return "hi"

        return "en"

    except:
        return "en"

def translate_text(text, target_lang='en'):
    # map long names to short codes
    mapping = {'english': 'en', 'hindi': 'hi', 'kannada': 'kn'}
    target_lang = mapping.get(target_lang.lower(), target_lang)

    if target_lang not in SUPPORTED_LANGUAGES and target_lang not in SUPPORTED_LANGUAGES.values():
        target_lang = 'en'
    try:
        translator = GoogleTranslator(source='auto', target=target_lang)
        return translator.translate(text)
    except Exception as e:
        print(f"Translation Error: {e}")
        return text
