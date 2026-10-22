from pathlib import Path

from app.core.config import Settings
from app.core.errors import ProviderUnavailable
from app.schemas.skills import RawExtraction

PROMPT_VERSION = "skills-v1"
SYSTEM_PROMPT = (Path(__file__).resolve().parents[1] / "prompts/skills_v1.txt").read_text(encoding="utf-8")


class GeminiEmbeddingProvider:
    def __init__(self, settings: Settings):
        self.settings = settings
        self.model_name = settings.EMBEDDING_MODEL
        self.model_revision = settings.EMBEDDING_MODEL_REVISION
        self.chunk_policy = "provider-input-v1"

    def embed(self, text, task):
        try:
            from google import genai
            from google.genai import types

            with genai.Client(
                api_key=self.settings.GEMINI_API_KEY.get_secret_value(),
                http_options=types.HttpOptions(
                    timeout=int(self.settings.PROVIDER_TIMEOUT_SECONDS * 1000),
                    retry_options=types.HttpRetryOptions(attempts=1),
                ),
            ) as client:
                response = client.models.embed_content(
                    model=self.model_name,
                    contents=text,
                    config=types.EmbedContentConfig(
                        task_type=task.upper(), output_dimensionality=self.settings.EMBEDDING_DIMENSION,
                    ),
                )
                if not response.embeddings or not response.embeddings[0].values:
                    raise ProviderUnavailable("empty_embedding")
                return response.embeddings[0].values
        except ProviderUnavailable:
            raise
        except Exception:
            raise ProviderUnavailable("embedding_provider_failed") from None

    def embed_batch(self, texts, task):
        try:
            from google import genai
            from google.genai import types

            with genai.Client(
                api_key=self.settings.GEMINI_API_KEY.get_secret_value(),
                http_options=types.HttpOptions(
                    timeout=int(self.settings.PROVIDER_TIMEOUT_SECONDS * 1000),
                    retry_options=types.HttpRetryOptions(attempts=1),
                ),
            ) as client:
                response = client.models.embed_content(
                    model=self.model_name,
                    contents=texts,
                    config=types.EmbedContentConfig(
                        task_type=task.upper(), output_dimensionality=self.settings.EMBEDDING_DIMENSION,
                    ),
                )
                vectors = [item.values for item in response.embeddings or []]
                if len(vectors) != len(texts) or any(not vector for vector in vectors):
                    raise ProviderUnavailable("invalid_embedding_batch")
                return vectors
        except ProviderUnavailable:
            raise
        except Exception:
            raise ProviderUnavailable("embedding_provider_failed") from None


class GeminiSkillExtractionProvider:
    def __init__(self, settings: Settings):
        self.settings = settings
        self.model_name = settings.LLM_MODEL

    def extract(self, text):
        try:
            from google import genai
            from google.genai import types

            with genai.Client(
                api_key=self.settings.GEMINI_API_KEY.get_secret_value(),
                http_options=types.HttpOptions(
                    timeout=int(self.settings.PROVIDER_TIMEOUT_SECONDS * 1000),
                    retry_options=types.HttpRetryOptions(attempts=1),
                ),
            ) as client:
                response = client.models.generate_content(
                    model=self.model_name,
                    contents=text,
                    config=types.GenerateContentConfig(
                        system_instruction=SYSTEM_PROMPT, response_mime_type="application/json",
                        response_schema=RawExtraction, temperature=0,
                    ),
                )
                return RawExtraction.model_validate_json(response.text or "")
        except Exception:
            raise ProviderUnavailable("extraction_provider_failed") from None
