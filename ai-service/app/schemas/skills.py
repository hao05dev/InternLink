from typing import Annotated, Literal

from pydantic import AfterValidator, BaseModel, Field, StringConstraints

def nonblank(value: str) -> str:
    if not value.strip():
        raise ValueError("Text must not be blank")
    return value


# Preserve original offsets so evidence remains linked to the submitted text.
TextInput = Annotated[str, StringConstraints(min_length=1, max_length=100_000), AfterValidator(nonblank)]
SkillName = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=200)]


class ExtractSkillRequest(BaseModel):
    text: TextInput
    source_type: Literal["cv", "jd"] = "cv"
    allow_cloud: bool = False


class NormalizeSkillRequest(BaseModel):
    raw_skills: list[SkillName] = Field(max_length=500)


class TaxonomySkill(BaseModel):
    id: str
    name: str
    category: str
    synonyms: list[str] = Field(default_factory=list)


class TaxonomyResponse(BaseModel):
    count: int
    version: str
    source: str = "internlink-curated; ESCO mapping pending"
    skills: list[TaxonomySkill]


class NormalizeResponse(BaseModel):
    normalized: list[TaxonomySkill]
    unmatched: list[str]


class RawSkillMention(BaseModel):
    name: SkillName
    quote: str = Field(min_length=1, max_length=2000)


class RawExtraction(BaseModel):
    mentions: list[RawSkillMention] = Field(default_factory=list, max_length=500)


class SkillEvidence(BaseModel):
    quote: str
    start: int = Field(ge=0)
    end: int = Field(gt=0)


class ExtractedSkill(BaseModel):
    id: str
    name: str
    category: str
    raw_mention: str
    evidence: SkillEvidence
    assertion_status: Literal["mentioned", "negated", "learning"] = "mentioned"
    requirement_type: Literal["mandatory", "optional", "unspecified"] = "unspecified"
    requires_confirmation: bool = True


class ExtractSkillResponse(BaseModel):
    model: str
    mode: Literal["rule_based", "gemini"]
    status: Literal["COMPLETED"] = "COMPLETED"
    taxonomy_version: str
    prompt_version: str | None = None
    total_extracted: int
    normalized_skills: list[ExtractedSkill]
    unmatched_skills: list[str]
    experience_level: str = "Unknown"
    warnings: list[str] = Field(default_factory=list)
    source_hash: str | None = None
    page_count: int | None = None
