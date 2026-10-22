from fastapi import APIRouter

from app.api.dependencies import ServicesDep
from app.schemas.matching import (
    BatchEmbeddingRequest,
    BatchEmbeddingResponse,
    BatchEmbeddingResult,
    EmbeddingInfoResponse,
    EmbeddingRequest,
    EmbeddingResponse,
    RankJobsRequest,
    RankJobsResponse,
)

router = APIRouter(prefix="/api/v1/matching", tags=["Matching & Ranking"])


@router.post("/embedding", response_model=EmbeddingResponse)
def generate_embedding(request: EmbeddingRequest, services: ServicesDep):
    vector = services.embeddings.get_embedding(request.text, request.task)
    return EmbeddingResponse(
        dimension=len(vector), embedding=vector,
        model=services.embeddings.model_name,
        model_revision=services.embeddings.model_revision,
        task=request.task,
        source_hash=services.embeddings.source_hash(request.text),
        chunk_policy=services.embeddings.chunk_policy,
    )


@router.get("/embedding/info", response_model=EmbeddingInfoResponse)
def embedding_info(services: ServicesDep):
    return EmbeddingInfoResponse(
        enabled=services.embeddings.provider is not None,
        model=services.embeddings.model_name,
        model_revision=services.embeddings.model_revision,
        dimension=services.embeddings.dimension,
        chunk_policy=services.embeddings.chunk_policy,
    )


@router.post("/embedding/batch", response_model=BatchEmbeddingResponse)
def generate_embedding_batch(request: BatchEmbeddingRequest, services: ServicesDep):
    results = []
    for task in ("retrieval_query", "retrieval_document"):
        items = [item for item in request.items if item.task == task]
        if not items:
            continue
        vectors = services.embeddings.get_embeddings([item.text for item in items], task)
        results.extend(BatchEmbeddingResult(
            id=item.id,
            dimension=len(vector),
            embedding=vector,
            model=services.embeddings.model_name,
            model_revision=services.embeddings.model_revision,
            task=item.task,
            source_hash=services.embeddings.source_hash(item.text),
            chunk_policy=services.embeddings.chunk_policy,
        ) for item, vector in zip(items, vectors, strict=True))
    by_id = {item.id: item for item in results}
    return BatchEmbeddingResponse(results=[by_id[item.id] for item in request.items])


@router.post("/rank-jobs", response_model=RankJobsResponse)
def rank_jobs(request: RankJobsRequest, services: ServicesDep):
    return services.matching.rank_jobs(request)
