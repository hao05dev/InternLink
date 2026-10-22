import math
from typing import Annotated, Literal

from pydantic import BaseModel, ConfigDict, Field, StringConstraints, field_validator, model_validator

from app.schemas.skills import SkillName, TextInput

Identifier = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=200)]


class EmbeddedDocument(BaseModel):
    model_config = ConfigDict(allow_inf_nan=False)
    embedding: list[float] | None = Field(default=None, min_length=1, max_length=4096)
    embedding_model: str | None = Field(default=None, min_length=1, max_length=200)

    @field_validator("embedding")
    @classmethod
    def valid_vector(cls, value):
        if value is not None and (not all(math.isfinite(v) for v in value) or not any(value)):
            raise ValueError("Embedding must be finite and non-zero")
        return value

    @model_validator(mode="after")
    def require_provenance(self):
        if self.embedding is not None and not self.embedding_model:
            raise ValueError("Supplied embeddings require embedding_model provenance")
        return self


class StudentProfileDTO(EmbeddedDocument):
    id: Identifier
    full_name: str | None = Field(default=None, max_length=200)
    major: str | None = Field(default=None, max_length=200)
    gpa: float | None = Field(default=None, ge=0, le=4)
    skill_ids: list[SkillName] = Field(max_length=500)
    bio_summary: str | None = Field(default="", max_length=100_000)


class JobDTO(EmbeddedDocument):
    id: Identifier
    title: str = Field(min_length=1, max_length=500)
    company_name: str | None = Field(default=None, max_length=500)
    target_major: str | None = Field(default=None, max_length=200)
    mandatory_skill_ids: list[SkillName] = Field(max_length=500)
    optional_skill_ids: list[SkillName] = Field(default_factory=list, max_length=500)
    description: str | None = Field(default="", max_length=100_000)


class RankJobsRequest(BaseModel):
    student: StudentProfileDTO
    jobs: list[JobDTO] = Field(max_length=200)

    @model_validator(mode="after")
    def unique_jobs_and_bounded_text(self):
        if len({job.id for job in self.jobs}) != len(self.jobs):
            raise ValueError("Duplicate job IDs are not allowed")
        if sum(len(job.description or "") for job in self.jobs) > 500_000:
            raise ValueError("Batch descriptions exceed 500,000 characters")
        return self


class EmbeddingRequest(BaseModel):
    text: TextInput
    task: Literal["retrieval_query", "retrieval_document"] = "retrieval_document"


class EmbeddingResponse(BaseModel):
    dimension: int
    embedding: list[float]
    model: str
    model_revision: str
    task: Literal["retrieval_query", "retrieval_document"]
    source_hash: str = Field(pattern=r"^[a-f0-9]{64}$")
    chunk_policy: str


class BatchEmbeddingItem(EmbeddingRequest):
    id: Identifier


class BatchEmbeddingRequest(BaseModel):
    items: list[BatchEmbeddingItem] = Field(min_length=1, max_length=128)

    @model_validator(mode="after")
    def unique_items_and_bounded_text(self):
        if len({item.id for item in self.items}) != len(self.items):
            raise ValueError("Duplicate embedding item IDs are not allowed")
        if sum(len(item.text) for item in self.items) > 500_000:
            raise ValueError("Batch embedding text exceeds 500,000 characters")
        return self


class BatchEmbeddingResult(EmbeddingResponse):
    id: Identifier


class BatchEmbeddingResponse(BaseModel):
    results: list[BatchEmbeddingResult]


class EmbeddingInfoResponse(BaseModel):
    enabled: bool
    model: str | None = None
    model_revision: str | None = None
    dimension: int
    chunk_policy: str | None = None


class MatchResult(BaseModel):
    job_id: str
    job_title: str
    company_name: str | None = None
    final_score: float
    match_percentage: float
    skill_score: float
    semantic_score: float
    mandatory_score: float = 0.0
    optional_score: float = 0.0
    score_label: str = "Chưa đủ dữ liệu"
    # Retained for the v1 Java mapper; excluded from the formula.
    academic_score: float = 0.0
    matched_skills: list[str]
    missing_skills: list[str]
    recommendation: str
    mode: Literal["hybrid", "skill_only", "semantic_only", "insufficient_data"]
    score_available: bool
    semantic_available: bool
    algorithm_version: str = "skill-semantic-v2"
    effective_weights: dict[str, float] = Field(default_factory=dict)
    component_availability: dict[str, bool] = Field(default_factory=dict)
    warnings: list[str] = Field(default_factory=list)


class RankJobsResponse(BaseModel):
    total_ranked: int
    rankings: list[MatchResult]
