"""
AgroGuardian AI — Retrieval Service (RAG)
Provides contextual knowledge for chatbot using simple keyword matching
"""

# ══════════════════════════════════════════════════════════════════════
# KNOWLEDGE BASE (can later move to DB / vector DB)
# ══════════════════════════════════════════════════════════════════════

KNOWLEDGE_BASE = [
    {
        "keywords": ["rice disease", "brown spots", "fungus rice"],
        "content": "Rice brown spot disease is caused by fungus. Use fungicides like carbendazim and ensure proper drainage."
    },
    {
        "keywords": ["wheat pest", "aphids wheat"],
        "content": "Aphids in wheat can be controlled using neem oil spray or imidacloprid insecticide."
    },
    {
        "keywords": ["pm kisan", "government scheme"],
        "content": "PM-KISAN provides ₹6000 per year to farmers in 3 installments directly to their bank accounts."
    },
    {
        "keywords": ["irrigation drip"],
        "content": "Drip irrigation saves water and improves yield by delivering water directly to plant roots."
    },
    {
        "keywords": ["fertilizer nitrogen"],
        "content": "Nitrogen fertilizers like urea should be applied in split doses for better absorption."
    }
]


# ══════════════════════════════════════════════════════════════════════
# SIMPLE RETRIEVAL LOGIC
# ══════════════════════════════════════════════════════════════════════

def retrieve_context(query: str, nlp_data: dict = None) -> str:
    """
    Returns relevant context based on query + NLP intent/entities
    """

    query_lower = query.lower()
    context_results = []

    # 🔥 1. Match from knowledge base
    for item in KNOWLEDGE_BASE:
        if any(keyword in query_lower for keyword in item["keywords"]):
            context_results.append(item["content"])

    # 🔥 2. Use NLP intent (extra boost)
    if nlp_data:
        intent = nlp_data.get("intent")

        if intent == "disease":
            context_results.append("Crop diseases are often caused by fungi, bacteria, or viruses. Early detection is important.")

        elif intent == "pest":
            context_results.append("Pest attacks can reduce yield. Use integrated pest management techniques.")

        elif intent == "weather":
            context_results.append("Weather conditions like rainfall and temperature directly affect crop growth.")

        elif intent == "scheme":
            context_results.append("Government schemes provide financial and insurance support to farmers.")

    # 🔥 3. Remove duplicates
    context_results = list(set(context_results))

    # 🔥 4. Limit context size
    return "\n".join(context_results[:3])