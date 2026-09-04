from typing import List
import numpy as np
import google.generativeai as genai
from app.config import settings

class EmbeddingService:
    def __init__(self):
        if settings.GEMINI_API_KEY:
            genai.configure(api_key=settings.GEMINI_API_KEY)
        self.dimension = 768

    def get_embedding(self, text: str) -> List[float]:
        clean_text = text.strip()
        if not clean_text:
            return [0.0] * self.dimension

        if settings.GEMINI_API_KEY:
            try:
                result = genai.embed_content(
                    model=settings.EMBEDDING_MODEL,
                    content=clean_text,
                    task_type="retrieval_document"
                )
                embedding = result.get("embedding", [])
                if len(embedding) == self.dimension:
                    return embedding
            except Exception as e:
                print(f"[WARN] Error creating Gemini embedding: {e}")

        # Deterministic fallback vector for local testing without API key
        return self._generate_fallback_vector(clean_text)

    def get_query_embedding(self, query: str) -> List[float]:
        clean_query = query.strip()
        if not clean_query:
            return [0.0] * self.dimension

        if settings.GEMINI_API_KEY:
            try:
                result = genai.embed_content(
                    model=settings.EMBEDDING_MODEL,
                    content=clean_query,
                    task_type="retrieval_query"
                )
                embedding = result.get("embedding", [])
                if len(embedding) == self.dimension:
                    return embedding
            except Exception as e:
                print(f"[WARN] Error creating Gemini query embedding: {e}")

        return self._generate_fallback_vector(clean_query)

    def _generate_fallback_vector(self, text: str) -> List[float]:
        import hashlib
        seed = int(hashlib.md5(text.encode("utf-8")).hexdigest(), 16) % (2**32)
        rng = np.random.default_rng(seed)
        vec = rng.standard_normal(self.dimension)
        norm = np.linalg.norm(vec)
        if norm > 0:
            vec = vec / norm
        return vec.tolist()

embedding_service = EmbeddingService()
