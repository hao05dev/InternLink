import math
from hashlib import sha256
from typing import Literal

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

    @property
    def model_name(self) -> str | None:
        return self.provider.model_name if self.provider else None

    @property
    def model_revision(self) -> str | None:
        return getattr(self.provider, "model_revision", None) if self.provider else None

    @property
    def chunk_policy(self) -> str | None:
        return getattr(self.provider, "chunk_policy", None) if self.provider else None

    def source_hash(self, text: str) -> str:
        return sha256(text.strip().encode("utf-8")).hexdigest()

    def get_embeddings(
        self,
        texts: list[str],
        task: Literal["retrieval_query", "retrieval_document"],
    ) -> list[list[float]]:
        if self.provider is None:
            raise ProviderUnavailable("embedding_disabled")
        if any(not text.strip() for text in texts):
            raise ProviderUnavailable("empty_embedding_input")
        batch_embed = getattr(self.provider, "embed_batch", None)
        vectors = batch_embed([text.strip() for text in texts], task) if callable(batch_embed) else [
            self.provider.embed(text.strip(), task) for text in texts
        ]
        if len(vectors) != len(texts):
            raise ProviderUnavailable("invalid_embedding_batch")
        for vector in vectors:
            if len(vector) != self.dimension or not all(math.isfinite(v) for v in vector) or not any(vector):
                raise ProviderUnavailable("invalid_embedding_output")
        return vectors
