from fastapi import APIRouter

from app.api.dependencies import ServicesDep
from app.schemas.matching import EmbeddingRequest, EmbeddingResponse, RankJobsRequest, RankJobsResponse

router = APIRouter(prefix="/api/v1/matching", tags=["Matching & Ranking"])


@router.post("/embedding", response_model=EmbeddingResponse)
def generate_embedding(request: EmbeddingRequest, services: ServicesDep):
    vector = services.embeddings.get_embedding(request.text, request.task)
    return EmbeddingResponse(
        dimension=len(vector), embedding=vector,
        model=services.embeddings.provider.model_name,
    )


@router.post("/rank-jobs", response_model=RankJobsResponse)
def rank_jobs(request: RankJobsRequest, services: ServicesDep):
    return services.matching.rank_jobs(request)
