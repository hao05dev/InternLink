from types import SimpleNamespace
from unittest.mock import MagicMock

import pytest
from pydantic import ValidationError

from app.core.config import Settings
from app.core.errors import ProviderUnavailable
from app.providers.gemini import GeminiEmbeddingProvider, GeminiSkillExtractionProvider
from app.services.embedding_service import EmbeddingService


@pytest.mark.parametrize("vector", [[0, 0], [1], [float("nan"), 1]])
def test_bad_provider_vectors_never_become_semantic_evidence(vector):
    provider = SimpleNamespace(model_name="test", embed=lambda text, task: vector)
    with pytest.raises(ProviderUnavailable, match="invalid_embedding_output"):
        EmbeddingService(provider, dimension=2).get_embedding("Java")


def test_query_and_document_task_types():
    seen = []
    provider = SimpleNamespace(model_name="test", embed=lambda text, task: seen.append(task) or [1, 0])
    service = EmbeddingService(provider, dimension=2)
    service.get_embedding("Java")
    service.get_query_embedding("Java")
    assert seen == ["retrieval_document", "retrieval_query"]


def test_cloud_provider_requires_explicit_model():
    with pytest.raises(ValidationError, match="LLM_MODEL"):
        Settings(_env_file=None, EXTRACTION_PROVIDER="gemini", EMBEDDING_PROVIDER="disabled",
                 GEMINI_API_KEY="test-key", LLM_MODEL="")


def test_cloud_embedding_requires_immutable_revision():
    with pytest.raises(ValidationError, match="EMBEDDING_MODEL_REVISION"):
        Settings(
            _env_file=None,
            EXTRACTION_PROVIDER="rules",
            EMBEDDING_PROVIDER="gemini",
            GEMINI_API_KEY="test-key",
            EMBEDDING_MODEL="test-embedding",
            EMBEDDING_MODEL_REVISION="",
        )


def test_offline_defaults_ignore_legacy_key(config):
    assert config.EXTRACTION_PROVIDER == "rules"
    assert config.EMBEDDING_PROVIDER == "disabled"


@pytest.mark.parametrize(
    ("field", "value"),
    [("EMBEDDING_PROVIDER", "local_dense"), ("MATCHING_ALGORITHM", "ltr_ml")],
)
def test_untrained_baselines_cannot_be_enabled_for_online_inference(field, value):
    with pytest.raises(ValidationError):
        Settings(_env_file=None, **{field: value})


def test_gemini_adapter_contract_with_mock_sdk(config, monkeypatch):
    genai = pytest.importorskip("google.genai")
    config.GEMINI_API_KEY = config.GEMINI_API_KEY.__class__("test-key")
    config.LLM_MODEL = "test-extractor"
    config.EMBEDDING_MODEL = "test-embedding"
    config.EMBEDDING_DIMENSION = 2
    sdk = MagicMock()
    sdk.models.embed_content.return_value = SimpleNamespace(embeddings=[SimpleNamespace(values=[1, 0])])
    sdk.models.generate_content.return_value = SimpleNamespace(text='{"mentions":[{"name":"Java","quote":"Java"}]}')
    context = MagicMock()
    context.__enter__.return_value = sdk
    monkeypatch.setattr(genai, "Client", MagicMock(return_value=context))
    assert GeminiEmbeddingProvider(config).embed("Java", "retrieval_query") == [1, 0]
    assert sdk.models.embed_content.call_args.kwargs["config"].task_type == "RETRIEVAL_QUERY"
    assert GeminiSkillExtractionProvider(config).extract("Java").mentions[0].name == "Java"


def test_provider_errors_do_not_expose_secrets(config, monkeypatch):
    genai = pytest.importorskip("google.genai")
    monkeypatch.setattr(genai, "Client", MagicMock(side_effect=RuntimeError("SECRET CV")))
    with pytest.raises(ProviderUnavailable) as caught:
        GeminiEmbeddingProvider(config).embed("Java", "retrieval_document")
    assert "SECRET" not in str(caught.value)
