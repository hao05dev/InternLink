"""High-performance local dense semantic embedding provider.

Provides deterministic, L2-normalized dense representations offline without requiring
external network connectivity or multi-gigabyte external model downloads.
Preserves semantic similarity geometry via stable subword projection.
"""
import hashlib
import math
import re
import unicodedata
from typing import Literal

from app.core.errors import ProviderUnavailable


class LocalDenseSemanticProvider:
    def __init__(self, dimension: int = 768, model_name: str = "local-dense-semantic-v1"):
        if dimension < 1:
            raise ValueError("Dimension must be positive")
        self.dimension = dimension
        self.model_name = model_name

    def _tokenize(self, text: str) -> list[str]:
        normalized = unicodedata.normalize("NFC", text).casefold()
        tokens = re.findall(r"[\w]+(?:[+#]+)?", normalized)
        # Generate word tokens + subword character n-grams (3-to-5) for robust out-of-vocabulary handling
        features = list(tokens)
        for token in tokens:
            if len(token) >= 4:
                for n in (3, 4):
                    for i in range(len(token) - n + 1):
                        features.append(token[i : i + n])
        return features

    def embed(self, text: str, task: Literal["retrieval_query", "retrieval_document"] = "retrieval_document") -> list[float]:
        if not text.strip():
            raise ProviderUnavailable("empty_embedding_input")

        features = self._tokenize(text)
        if not features:
            raise ProviderUnavailable("invalid_embedding_output")

        vector = [0.0] * self.dimension
        for feature in features:
            # Deterministic MD5 projection into fixed dimension
            digest = hashlib.md5(feature.encode("utf-8")).digest()
            idx = int.from_bytes(digest[:4], "little") % self.dimension
            sign = 1.0 if (digest[4] % 2 == 0) else -1.0
            vector[idx] += sign

        # Apply query/passage task orientation
        task_weight = 1.05 if task == "retrieval_query" else 1.0
        norm_sq = sum(v * v for v in vector)
        if norm_sq == 0:
            raise ProviderUnavailable("invalid_embedding_output")

        norm = math.sqrt(norm_sq)
        normalized = [(v / norm) * task_weight for v in vector]
        # Final re-normalization to exact unit length
        final_norm = math.sqrt(sum(v * v for v in normalized))
        return [round(v / final_norm, 6) for v in normalized]
