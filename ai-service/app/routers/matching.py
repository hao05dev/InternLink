from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from app.services.ranking_service import ranking_service
from app.services.embedding_service import embedding_service

router = APIRouter(prefix="/api/v1/matching", tags=["Matching & Ranking"])

class StudentProfileDTO(BaseModel):
    id: str
    full_name: Optional[str] = None
    major: Optional[str] = None
    gpa: Optional[float] = 3.0
    skill_ids: List[str]
    bio_summary: Optional[str] = ""
    embedding: Optional[List[float]] = None

class JobDTO(BaseModel):
    id: str
    title: str
    company_name: Optional[str] = None
    target_major: Optional[str] = None
    mandatory_skill_ids: List[str]
    optional_skill_ids: Optional[List[str]] = []
    description: Optional[str] = ""
    embedding: Optional[List[float]] = None

class RankJobsRequest(BaseModel):
    student: StudentProfileDTO
    jobs: List[JobDTO]

class EmbeddingRequest(BaseModel):
    text: str

@router.post("/embedding")
def generate_embedding(req: EmbeddingRequest):
    vec = embedding_service.get_embedding(req.text)
    return {
        "dimension": len(vec),
        "embedding": vec
    }

@router.post("/rank-jobs")
def rank_jobs_for_student(req: RankJobsRequest):
    student_dict = req.student.model_dump()
    # If student embedding is missing, generate it from bio_summary
    if not student_dict.get("embedding") and student_dict.get("bio_summary"):
        student_dict["embedding"] = embedding_service.get_embedding(student_dict["bio_summary"])

    ranked_results = []
    for job in req.jobs:
        job_dict = job.model_dump()
        if not job_dict.get("embedding") and job_dict.get("description"):
            job_dict["embedding"] = embedding_service.get_embedding(job_dict["description"])
        
        match_info = ranking_service.rank_job_for_student(student_dict, job_dict)
        ranked_results.append(match_info)

    # Sort descending by final score
    ranked_results.sort(key=lambda x: x["final_score"], reverse=True)
    return {
        "total_ranked": len(ranked_results),
        "rankings": ranked_results
    }
