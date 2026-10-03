from fastapi import APIRouter, HTTPException

from app.api.dependencies import ServicesDep
from app.schemas.assistance import (
    JobReviewRequest, JobReviewResponse, JournalSummaryRequest,
    JournalSummaryResponse, LearningPlanRequest, LearningPlanResponse,
)
from app.services.assistance_service import AssistanceService

router = APIRouter(prefix="/api/v1/assistance", tags=["Assisted drafts"])


@router.post("/job-review", response_model=JobReviewResponse)
def review_job(request: JobReviewRequest, services: ServicesDep):
    return AssistanceService(services.taxonomy).review_job(request)


@router.post("/journal-summary", response_model=JournalSummaryResponse)
def summarize(request: JournalSummaryRequest, services: ServicesDep):
    if sum(len(entry.text) for entry in request.entries) > 200_000:
        raise HTTPException(422, "journal_text_too_large")
    return AssistanceService(services.taxonomy).summarize_journals(request)


@router.post("/learning-plan", response_model=LearningPlanResponse)
def plan(request: LearningPlanRequest, services: ServicesDep):
    try:
        return AssistanceService(services.taxonomy).learning_plan(request)
    except ValueError:
        raise HTTPException(422, "unknown_skill") from None
