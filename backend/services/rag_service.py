import os
import json
import numpy as np
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

# Set up Gemini Key
genai.configure(api_key=os.getenv("GEMINI_API_KEY", ""))

class RAGVectorStore:
    def __init__(self):
        self.documents = []
        self.embeddings = []
        self.store_file = "ml_models/rag_store.json"
        self._load_or_build_store()

    def _load_or_build_store(self):
        # 1. Check if pre-computed vector store exists
        if os.path.exists(self.store_file):
            try:
                with open(self.store_file, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    self.documents = data["documents"]
                    self.embeddings = [np.array(e) for e in data["embeddings"]]
                print(f"[RAGVectorStore] Loaded {len(self.documents)} vector documents from store.")
                return
            except Exception as e:
                print(f"[RAGVectorStore] Failed to load store, rebuilding: {e}")

        # 2. Build store from rich agricultural guidelines
        raw_docs = [
            # Apple Diseases
            {
                "title": "Apple Black Rot Control",
                "text": "Apple Black Rot is caused by the fungus Botryosphaeria obtusa. It spreads during warm, wet spring conditions. Pruning dead wood during the winter is the most critical sanitation step. Apply organic copper-based fungicides starting from the silver tip stage at weekly intervals. Keep the orchard floor clean of mummified fruits and fallen leaves."
            },
            {
                "title": "Apple Cedar Rust Treatment",
                "text": "Apple Cedar Rust is caused by the fungus Gymonosporangium juniperi-virginianae. It requires red cedar trees and apple trees to complete its lifecycle. Spray protective fungicides containing Myclobutanil or copper before symptoms appear, starting from pink bud stage. Planting rust-resistant varieties like Liberty is highly effective."
            },
            {
                "title": "Apple Scab Management",
                "text": "Apple Scab is caused by the fungus Venturia inaequalis. It infects leaves and fruit under cool, humid, and rainy spring conditions. Apply systemic fungicides like lime-sulfur or captan starting from green tip stage. Pruning trees to improve air flow and allowing leaves to dry quickly is vital."
            },
            # Corn Diseases
            {
                "title": "Corn Northern Leaf Blight Control",
                "text": "Corn Northern Leaf Blight is caused by the fungus Exserohilum turcicum. It thrives in moderate temperatures (18-27°C) and high humidity. Rotate crops with non-grasses for at least one year. Apply triazole or strobilurin fungicides if symptoms appear on upper leaves before silking. Perform deep tillage to bury infected plant residues."
            },
            {
                "title": "Corn Cercospora / Gray Leaf Spot Prevention",
                "text": "Gray Leaf Spot is caused by the fungus Cercospora zeae-maydis. It is favored by warm, humid weather and spreads from crop residues on the soil surface. Implement crop rotation, perform clean tillage to reduce surface residue, and plant high-yield resistant hybrid seeds. Foliar fungicides should be applied early."
            },
            {
                "title": "Corn Common Rust Strategy",
                "text": "Corn Common Rust is caused by the fungus Puccinia sorghi. Spores are blown by wind from warm regions, thriving in cool temperatures (16-23°C) and high humidity. Utilize resistant corn hybrids and schedule early planting to avoid peak spore migration seasons. Apply protective fungicides containing strobilurins if infection occurs early."
            },
            # Grape Diseases
            {
                "title": "Grape Black Rot Mitigation",
                "text": "Grape Black Rot is caused by the fungus Guignardia bidwellii, thriving in warm, wet weather. Prune vines to maintain an open canopy for sunlight and air flow. Apply effective fungicides such as mancozeb, captan, or myclobutanil starting from early bloom through fruit set. Remove and burn mummified berries from the vineyard floor."
            },
            {
                "title": "Grape Esca Treatment and Surgery",
                "text": "Grape Esca is a wood disease complex. No chemical cure exists for infected vine trunks. Remedial surgery (trunk renewal) or complete vine replacement is required. Prune during dry weather to minimize wound infection, and treat cuts immediately with biological agents or copper-based paints."
            },
            {
                "title": "Grape Leaf Blight Remedies",
                "text": "Grape Leaf Blight is caused by the fungus Pseudocercospora vitis, affecting mature leaves late in the season under warm, humid conditions. Maintain proper row spacing and weed control to reduce microclimatic humidity. Apply copper fungicides or carbendazim to limit spore spread and remove fallen infected leaves."
            },
            # Mango Diseases
            {
                "title": "Mango Anthracnose Care",
                "text": "Mango Anthracnose is caused by Colletotrichum gloeosporioides, thriving in high humidity and frequent rainfall. Spray systemic fungicides like carbendazim or copper oxychloride at 15-day intervals during flowering and leaf flush. Hot water treatment (52°C for 5 mins) of harvested fruits prevents post-harvest rot."
            },
            {
                "title": "Mango Bacterial Canker Strategy",
                "text": "Mango Bacterial Canker is caused by Xanthomonas campestris pv. mangiferaeindicae, spreading via wind-blown rain and mechanical injuries. Spray Streptocycline (100 ppm) combined with Copper Oxychloride (0.3%) three times at 15-day intervals starting from leaf emergence. Avoid physical damage to tree bark."
            },
            {
                "title": "Mango Die Back Control",
                "text": "Mango Die Back is caused by Lasiodiplodia theobromae, causing twigs to dry out from the tip downwards. Prune infected twigs 3-4 inches below the infected zone and paint cuts with Bordeaux paste. Spray copper oxychloride (0.3%) on the tree canopy and control stem borers which create entry wounds."
            },
            # General Farming advice
            {
                "title": "Indian Soil Health and NPK Fertilization",
                "text": "Maintaining a balanced soil pH between 6.0 and 7.5 is crucial for optimal crop yield. Nitrogen (N) promotes leafy vegetative growth, Phosphorus (P) enhances root development and flowering, and Potassium (K) strengthens disease resistance and plant vigor. Apply well-decomposed organic manure annually."
            },
            {
                "title": "Sustainable Irrigation Practices",
                "text": "Drip irrigation is the most water-efficient method for row crops like grapes and mango orchards, saving up to 60% water compared to flood irrigation. Ensure proper drainage in corn fields to prevent waterlogging, which can cause root rot and fungal spore spread."
            },
            {
                "title": "Organic Pest Control Methods",
                "text": "Neem oil spray (1-2%) is a powerful natural insecticide for controlling sucking pests like aphids, spider mites, and whiteflies. Introduce natural predators like ladybugs or lacewings. For fungal control, use baking soda sprays or diluted sour buttermilk mixtures."
            }
        ]

        print("[RAGVectorStore] Generating embeddings for RAG database...")
        self.documents = raw_docs
        self.embeddings = []
        
        # Calculate embeddings
        for idx, doc in enumerate(raw_docs):
            full_text = f"{doc['title']}: {doc['text']}"
            embedding = self._get_embedding(full_text)
            if embedding is not None:
                self.embeddings.append(embedding)
            else:
                # Mock embedding fallback if API fails
                mock_emb = list(np.random.randn(768))
                self.embeddings.append(mock_emb)
            print(f"  Embedded doc {idx+1}/{len(raw_docs)}: '{doc['title']}'")

        # Save to file
        try:
            os.makedirs(os.path.dirname(self.store_file), exist_ok=True)
            with open(self.store_file, "w", encoding="utf-8") as f:
                json.dump({
                    "documents": self.documents,
                    "embeddings": [list(e) for e in self.embeddings]
                }, f, indent=4, ensure_ascii=False)
            print("[RAGVectorStore] Successfully saved vector database!")
        except Exception as e:
            print(f"[RAGVectorStore] Error saving store file: {e}")

    def _get_embedding(self, text):
        try:
            response = genai.embed_content(
                model="models/embedding-001",
                content=text,
                task_type="retrieval_document"
            )
            return response['embedding']
        except Exception as e:
            print(f"[RAGVectorStore] Embedding API call failed: {e}")
            return None

    def retrieve(self, query, top_k=2):
        print(f"[RAGVectorStore] Retrieving top_{top_k} for query: '{query}'")
        query_emb = self._get_embedding(query)
        if query_emb is None:
            # Fallback to simple keyword overlap if API fails
            print("[RAGVectorStore] API failed, falling back to TF-IDF style retrieval")
            scores = []
            words_query = set(query.lower().split())
            for doc in self.documents:
                words_doc = set((doc['title'] + " " + doc['text']).lower().split())
                overlap = len(words_query.intersection(words_doc))
                scores.append(overlap)
            top_indices = np.argsort(scores)[::-1][:top_k]
            return [self.documents[i] for i in top_indices]

        # Calculate cosine similarities
        similarities = []
        for emb in self.embeddings:
            dot_prod = np.dot(query_emb, emb)
            norm_q = np.linalg.norm(query_emb)
            norm_e = np.linalg.norm(emb)
            sim = dot_prod / (norm_q * norm_e)
            similarities.append(float(sim))

        top_indices = np.argsort(similarities)[::-1][:top_k]
        results = []
        for i in top_indices:
            results.append({
                "title": self.documents[i]["title"],
                "text": self.documents[i]["text"],
                "score": similarities[i]
            })
        return results

# Initialize store
try:
    rag_store = RAGVectorStore()
except Exception as e:
    print(f"Error starting RAG: {e}")
