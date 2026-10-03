import math

from app.core.errors import ProviderUnavailable
from app.providers.base import EmbeddingProvider


class EmbeddingService:
    def __init__(self, provider: EmbeddingProvider | None, dimension: int):
        self.provider = provider
        self.dimension = dimension

    def get_embedding(self, text: str, task="retrieval_document") -> list[float]:
        if self.provider is None:
            raise ProviderUnavailable("embedding_disabled")
        if not text.strip():
            raise ProviderUnavailable("empty_embedding_input")
        vector = self.provider.embed(text.strip(), task)
        if len(vector) != self.dimension or not all(math.isfinite(v) for v in vector) or not any(vector):
            raise ProviderUnavailable("invalid_embedding_output")
        return vector

    def get_query_embedding(self, text: str) -> list[float]:
        return self.get_embedding(text, task="retrieval_query")
