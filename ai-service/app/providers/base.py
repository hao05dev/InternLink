from typing import Literal, Protocol

from app.schemas.skills import RawExtraction


class EmbeddingProvider(Protocol):
    model_name: str

    def embed(self, text: str, task: Literal["retrieval_query", "retrieval_document"]) -> list[float]: ...


class SkillExtractionProvider(Protocol):
    model_name: str

    def extract(self, text: str) -> RawExtraction: ...
