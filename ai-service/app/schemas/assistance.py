from typing import Literal
from pydantic import BaseModel, Field
from app.schemas.skills import TextInput


class JobReviewRequest(BaseModel):
    description: TextInput
    learning_outcomes: list[str] = Field(default_factory=list, max_length=100)
    location: str = Field(default="", max_length=500)
    work_format: str = Field(default="", max_length=50)


class JournalEntry(BaseModel):
    id: str = Field(min_length=1, max_length=100)
    text: TextInput
    version: str = Field(min_length=1, max_length=200)
    verification: Literal["self_reported", "mentor_reviewed"] = "self_reported"


class JournalSummaryRequest(BaseModel):
    entries: list[JournalEntry] = Field(max_length=100)


class LearningPlanRequest(BaseModel):
    skill_ids: list[str] = Field(min_length=1, max_length=3)
    hours_per_week: int = Field(default=4, ge=1, le=20)


class Issue(BaseModel):
    code: str
    message: str
    field: str
    quote: str | None = None


class JobReviewResponse(BaseModel):
    mode: str = "checklist"
    checklist_version: str = "internlink-draft-v1"
    requires_review: bool = True
    issues: list[Issue]


class JournalClaim(BaseModel):
    skill_id: str
    skill_name: str
    entry_id: str
    source_version: str
    quote: str
    verification: str


class JournalSummaryResponse(BaseModel):
    mode: str = "extractive"
    requires_review: bool = True
    claims: list[JournalClaim]
    entry_count: int
    notice: str = "Đề cập trong nhật ký không tự chứng minh thành thạo hoặc đạt chuẩn đầu ra."


class LearningTask(BaseModel):
    skill_id: str
    skill_name: str
    objective: str
    task: str
    evidence: str
    review_criterion: str
    estimated_hours: float


class LearningPlanResponse(BaseModel):
    mode: str = "template"
    requires_review: bool = True
    tasks: list[LearningTask]
    notice: str = "Bản nháp để trao đổi với người hướng dẫn; thời lượng cần điều chỉnh theo năng lực thực tế."


class QueryParseRequest(BaseModel):
    query: str = Field(min_length=1, max_length=500)


class QueryParseResponse(BaseModel):
    parsed: bool = True
    raw_query: str
    extracted_skills: list[str] = Field(default_factory=list)
    suggested_role_level: str | None = None
    suggested_location: str | None = None
    suggested_industry: str | None = None
    suggested_work_format: str | None = None
    requires_stipend: bool | None = None
    cleaned_keywords: str
    summary_message: str

