"""
AgroGuardian AI — NLP Service
Basic intent + entity extraction for chatbot
"""

import re


# ══════════════════════════════════════════════════════════════════════
# INTENT KEYWORDS
# ══════════════════════════════════════════════════════════════════════

INTENTS = {
    "cultivation": [
        "grow", "growing", "cultivate", "cultivation", "plant", "planting", "step by step",
        "how to do", "how to grow", "nursery", "transplant", "spacing", "ugane", "ugana",
        "ugaane", "ugao", "lagana", "kheti", "anaaj", "fasal", "beleyuvudu", "beleyalu",
        "\u0909\u0917\u093e\u090f", "\u0909\u0917\u093e\u0928\u093e", "\u0916\u0947\u0924\u0940",
        "\u092b\u0938\u0932", "\u0905\u0928\u093e\u091c", "\u0915\u0943\u0937\u093f",
        "\u0c95\u0cc3\u0cb7\u0cbf", "\u0cac\u0cc6\u0cb3\u0cc6", "\u0cac\u0cc6\u0cb3\u0cc6\u0caf\u0cb2\u0cc1"
    ],
    "disease": [
        "disease", "infection", "spots", "fungus", "leaf", "yellowing", "wilting",
        "rog", "bimari", "patta", "patti", "fafund", "roga", "ele"
    ],
    "pest": [
        "pest", "insect", "bug", "worms", "attack", "keet", "kida", "keeda",
        "kit", "humla", "huluvu", "hulu"
    ],
    "yield": [
        "yield", "production", "harvest", "upaj", "paidawar", "utpadan", "katayi",
        "iluvare", "utpadane"
    ],
    "weather": [
        "weather", "rain", "temperature", "forecast", "mausam", "barish", "baarish",
        "tapman", "havaman", "male", "taapamaana"
    ],
    "scheme": [
        "scheme", "government", "pm-kisan", "loan", "subsidy", "yojana", "sarkar",
        "rin", "karja", "sala", "sabsidi"
    ],
    "soil": [
        "soil", "fertility", "nutrients", "ph", "mitti", "poshak", "mannu", "poshakansha",
        "loamy", "doamatt", "\u092e\u093f\u091f\u094d\u091f\u0940", "\u0926\u094b\u092e\u091f",
        "\u091c\u0932 \u0928\u093f\u0915\u093e\u0938", "\u0cae\u0ca3\u0ccd\u0ca3\u0cc1",
        "\u0cb2\u0ccb\u0cae\u0cbf", "\u0ca8\u0cc0\u0cb0\u0cc1"
    ],
    "irrigation": [
        "irrigation", "water", "drip", "sprinkler", "sinchai", "pani", "neer", "neeru",
        "niravari", "\u092a\u093e\u0928\u0940", "\u0938\u093f\u0902\u091a\u093e\u0908",
        "\u0ca8\u0cc0\u0cb0\u0cbe\u0cb5\u0cb0\u0cbf", "\u0c92\u0cb3\u0c9a\u0cb0\u0c82\u0ca1\u0cbf"
    ],
    "land": [
        "acre", "acres", "land", "field", "sunlight", "drainage", "\u090f\u0915\u0921\u093c",
        "\u090f\u0915\u0921", "\u091c\u092e\u0940\u0928", "\u0916\u0947\u0924",
        "\u0927\u0942\u092a", "\u0c8e\u0c95\u0cb0\u0cc6", "\u0c9c\u0cae\u0cc0\u0ca8\u0cc1",
        "\u0c95\u0ccd\u0cb7\u0cc7\u0ca4\u0ccd\u0cb0", "\u0cac\u0cbf\u0cb8\u0cbf\u0cb2\u0cc1"
    ],
}


# ══════════════════════════════════════════════════════════════════════
# ENTITY EXTRACTION
# ══════════════════════════════════════════════════════════════════════

CROPS = [
    "rice", "wheat", "maize", "corn", "sugarcane",
    "cotton", "tomato", "potato", "onion", "mango",
    "anaaj", "gehu", "gehun", "chawal", "dhaan", "makka", "bhutta", "butta", "ganna", "kapas",
    "tamatar", "aam", "mango", "aloo", "pyaz", "akki", "batta", "bhatha", "godi", "ragi",
    "mekkejola", "kabbu", "hatti", "tometo", "alugadde", "eerulli",
    "\u0927\u093e\u0928", "\u091a\u093e\u0935\u0932", "\u0917\u0947\u0939\u0942\u0902",
    "\u092e\u0915\u094d\u0915\u093e", "\u092d\u0941\u091f\u094d\u091f\u093e", "\u0917\u0928\u094d\u0928\u093e", "\u0915\u092a\u093e\u0938",
    "\u091f\u092e\u093e\u091f\u0930", "\u0906\u092e", "\u0906\u0932\u0942", "\u092a\u094d\u092f\u093e\u091c",
    "\u0c85\u0c95\u0ccd\u0c95\u0cbf", "\u0cad\u0ca4\u0ccd\u0ca4",
    "\u0c97\u0ccb\u0ca7\u0cbf", "\u0cae\u0cc6\u0c95\u0ccd\u0c95\u0cc6\u0c9c\u0ccb\u0cb3", "\u0c9c\u0ccb\u0cb3",
    "\u0c95\u0cac\u0ccd\u0cac\u0cc1", "\u0cb9\u0ca4\u0ccd\u0ca4\u0cbf",
    "\u0cae\u0cbe\u0cb5\u0cc1", "\u0cae\u0cbe\u0c82\u0c97\u0ccb",
    "\u0c9f\u0cca\u0cae\u0cc7\u0c9f\u0cca", "\u0c86\u0cb2\u0cc2\u0c97\u0ca1\u0ccd\u0ca1\u0cc6",
    "\u0c88\u0cb0\u0cc1\u0cb3\u0ccd\u0cb3\u0cbf"
]


def extract_entities(query: str):
    query_lower = query.lower()

    crop = None
    for c in CROPS:
        if c in query_lower:
            crop = c
            break

    numbers = re.findall(r"\d+(?:\.\d+)?", query)
    area_acres = None
    area_match = re.search(
        r"(\d+(?:\.\d+)?)\s*(?:acre|acres|\u090f\u0915\u0921\u093c|\u090f\u0915\u0921|\u0c8e\u0c95\u0cb0\u0cc6)",
        query_lower
    )
    if area_match:
        area_acres = float(area_match.group(1))

    return {
        "crop": crop,
        "numbers": numbers,
        "area_acres": area_acres
    }


# ══════════════════════════════════════════════════════════════════════
# MAIN NLP FUNCTION
# ══════════════════════════════════════════════════════════════════════

def process_query(query: str) -> dict:
    query_lower = query.lower()

    # 🔥 Intent detection
    intent = "general"
    for key, keywords in INTENTS.items():
        if any(k in query_lower for k in keywords):
            intent = key
            break

    # 🔥 Entity extraction
    entities = extract_entities(query)

    if intent == "general" and entities.get("crop"):
        intent = "cultivation"
    elif intent == "land" and entities.get("crop"):
        intent = "cultivation"

    return {
        "intent": intent,
        "entities": entities
    }
