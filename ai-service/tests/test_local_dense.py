import pytest

from app.core.errors import ProviderUnavailable
from app.providers.local_dense import LocalDenseSemanticProvider


def test_local_dense_provider_output():
    provider = LocalDenseSemanticProvider(dimension=256)
    assert provider.dimension == 256
    assert provider.model_name == "local-dense-semantic-v1"

    vec = provider.embed("Spring Boot Java Microservices", task="retrieval_document")
    assert len(vec) == 256
    assert all(isinstance(v, float) for v in vec)

    # Unit norm check: sum(v^2) should be approximately 1.0
    norm_sq = sum(v * v for v in vec)
    assert 0.99 <= norm_sq <= 1.01

    # Semantic similarity check: related queries should have higher cosine similarity than unrelated
    vec_java = provider.embed("Java Spring Boot backend developer", task="retrieval_query")
    vec_related = provider.embed("Lập trình viên Java Spring Boot phát triển backend", task="retrieval_document")
    vec_unrelated = provider.embed("Kế toán trưởng kiểm toán tài chính thuế", task="retrieval_document")

    sim_related = sum(a * b for a, b in zip(vec_java, vec_related))
    sim_unrelated = sum(a * b for a, b in zip(vec_java, vec_unrelated))
    assert sim_related > sim_unrelated


def test_local_dense_empty_input_raises():
    provider = LocalDenseSemanticProvider(dimension=128)
    with pytest.raises(ProviderUnavailable, match="empty_embedding_input"):
        provider.embed("   ")
