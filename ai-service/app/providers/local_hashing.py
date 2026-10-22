"""Offline lexical hashing baseline.

This provider is deterministic and useful for smoke tests, but it is not a
pretrained semantic embedding model and must not be wired into online inference.
"""
import hashlib
import math
import re
import unicodedata
from typing import Literal

from app.core.errors import ProviderUnavailable


class LocalHashingBaselineProvider:
    def __init__(self, dimension: int = 768, model_name: str = "local-hashing-baseline-v1"):
        if dimension < 1:
            raise ValueError("Dimension must be positive")
        self.dimension = dimension
        self.model_name = model_name

    def _tokenize(self, text: str) -> list[str]:
        normalized = unicodedata.normalize("NFC", text).casefold()
        tokens = re.findall(r"[\w]+(?:[+#]+)?", normalized)
        features = list(tokens)
        for token in tokens:
            if len(token) >= 4:
                for size in (3, 4):
                    features.extend(token[index:index + size] for index in range(len(token) - size + 1))
        return features

    def embed(
        self,
        text: str,
        task: Literal["retrieval_query", "retrieval_document"] = "retrieval_document",
    ) -> list[float]:
        del task  # This baseline has no asymmetric query/document encoding.
        if not text.strip():
            raise ProviderUnavailable("empty_embedding_input")
        features = self._tokenize(text)
        if not features:
            raise ProviderUnavailable("invalid_embedding_output")

        vector = [0.0] * self.dimension
        for feature in features:
            digest = hashlib.md5(feature.encode("utf-8")).digest()
            index = int.from_bytes(digest[:4], "little") % self.dimension
            vector[index] += 1.0 if digest[4] % 2 == 0 else -1.0

        norm = math.sqrt(sum(value * value for value in vector))
        if not norm:
            raise ProviderUnavailable("invalid_embedding_output")
        return [round(value / norm, 6) for value in vector]
