"""Opt-in local model; never automatically download model weights."""
from pathlib import Path
from threading import Lock

from app.core.errors import ProviderUnavailable


class LocalE5Provider:
    def __init__(self, path: str, revision: str):
        self.path = Path(path)
        self.model_name = f"local-e5:{revision}"
        self.model_revision = revision
        self.chunk_policy = "e5-token-mean-450-v1"
        self._model = None
        self._lock = Lock()

    def embed(self, text, task):
        try:
            if not self.path.is_dir():
                raise ProviderUnavailable("local_model_missing")
            with self._lock:
                if self._model is None:
                    from sentence_transformers import SentenceTransformer
                    self._model = SentenceTransformer(str(self.path), local_files_only=True)
            prefix = "query: " if task == "retrieval_query" else "passage: "
            # Token-aware chunks leave room for prefix and special tokens.
            tokens = self._model.tokenizer.encode(text, add_special_tokens=False)
            chunks = [prefix + self._model.tokenizer.decode(tokens[i:i + 450]) for i in range(0, len(tokens), 450)]
            vectors = self._model.encode(chunks, normalize_embeddings=True)
            vector = vectors.mean(axis=0)
            norm = float((vector @ vector) ** 0.5)
            return (vector / norm).tolist() if norm else []
        except ProviderUnavailable:
            raise
        except Exception:
            raise ProviderUnavailable("local_embedding_failed") from None

    def embed_batch(self, texts, task):
        return [self.embed(text, task) for text in texts]
