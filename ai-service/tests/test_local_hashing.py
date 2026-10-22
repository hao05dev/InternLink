import pytest

from app.core.errors import ProviderUnavailable
from app.providers.local_hashing import LocalHashingBaselineProvider


def test_local_hashing_baseline_output():
    provider = LocalHashingBaselineProvider(dimension=256)
    assert provider.dimension == 256
    assert provider.model_name == "local-hashing-baseline-v1"

    vector = provider.embed("Spring Boot Java Microservices")
    assert len(vector) == 256
    assert 0.99 <= sum(value * value for value in vector) <= 1.01


def test_local_hashing_baseline_only_detects_lexical_overlap():
    provider = LocalHashingBaselineProvider(dimension=256)
    query = provider.embed("Java Spring Boot backend", "retrieval_query")
    related = provider.embed("Java Spring Boot backend developer", "retrieval_document")
    unrelated = provider.embed("Kế toán kiểm toán tài chính", "retrieval_document")

    assert sum(a * b for a, b in zip(query, related)) > sum(
        a * b for a, b in zip(query, unrelated)
    )


def test_local_hashing_empty_input_raises():
    with pytest.raises(ProviderUnavailable, match="empty_embedding_input"):
        LocalHashingBaselineProvider(dimension=128).embed("   ")
