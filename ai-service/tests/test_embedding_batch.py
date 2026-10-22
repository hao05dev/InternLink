from types import SimpleNamespace

import pytest
from pydantic import ValidationError

from app.api.v1.routes.matching import generate_embedding_batch
from app.core.errors import ProviderUnavailable
from app.schemas.matching import BatchEmbeddingRequest
from app.services.embedding_service import EmbeddingService


class BatchProvider:
    model_name = "test-e5"
    model_revision = "revision-1"
    chunk_policy = "test-policy-v1"

    def __init__(self):
        self.calls = []

    def embed(self, text, task):
        return [1.0, 0.0]

    def embed_batch(self, texts, task):
        self.calls.append((texts, task))
        vector = [1.0, 0.0] if task == "retrieval_query" else [0.0, 1.0]
        return [vector for _ in texts]


def test_batch_embedding_groups_by_task_and_preserves_request_order():
    provider = BatchProvider()
    services = SimpleNamespace(embeddings=EmbeddingService(provider, dimension=2))
    request = BatchEmbeddingRequest(items=[
        {"id": "job-1", "text": "Java backend", "task": "retrieval_document"},
        {"id": "student-1", "text": "Java profile", "task": "retrieval_query"},
    ])

    response = generate_embedding_batch(request, services)

    assert [item.id for item in response.results] == ["job-1", "student-1"]
    assert response.results[0].embedding == [0.0, 1.0]
    assert response.results[1].embedding == [1.0, 0.0]
    assert all(item.model_revision == "revision-1" for item in response.results)
    assert all(len(item.source_hash) == 64 for item in response.results)
    assert len(provider.calls) == 2


def test_batch_embedding_rejects_duplicate_ids():
    with pytest.raises(ValidationError, match="Duplicate embedding item IDs"):
        BatchEmbeddingRequest(items=[
            {"id": "same", "text": "one"},
            {"id": "same", "text": "two"},
        ])


def test_batch_provider_must_return_one_valid_vector_per_input():
    provider = BatchProvider()
    provider.embed_batch = lambda texts, task: [[1.0, 0.0]]
    service = EmbeddingService(provider, dimension=2)

    with pytest.raises(ProviderUnavailable, match="invalid_embedding_batch"):
        service.get_embeddings(["one", "two"], "retrieval_document")


def test_source_hash_uses_normalized_boundary_whitespace():
    service = EmbeddingService(BatchProvider(), dimension=2)
    assert service.source_hash(" Java ") == service.source_hash("Java")
