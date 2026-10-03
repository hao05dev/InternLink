from fastapi import APIRouter, HTTPException
from app.ingestion.documents import DocumentInput, DocumentParseError, parse_document

from app.api.dependencies import ServicesDep
from app.schemas.skills import (
    ExtractSkillRequest, ExtractSkillResponse, NormalizeResponse,
    NormalizeSkillRequest, TaxonomyResponse,
)

router = APIRouter(prefix="/api/v1/skills", tags=["Skills"])


@router.get("/taxonomy", response_model=TaxonomyResponse)
def get_taxonomy(services: ServicesDep):
    return TaxonomyResponse(
        count=len(services.taxonomy.skills), version=services.taxonomy.version,
        skills=services.taxonomy.skills,
    )


@router.post("/extract", response_model=ExtractSkillResponse)
def extract_skills(request: ExtractSkillRequest, services: ServicesDep):
    return services.skills.extract_skills_from_text(request.text, request.source_type, request.allow_cloud)


@router.post("/extract-document", response_model=ExtractSkillResponse)
def extract_document(request: DocumentInput, services: ServicesDep):
    try:
        text, checksum, pages = parse_document(request)
    except DocumentParseError as error:
        raise HTTPException(422, str(error)) from None
    result = services.skills.extract_skills_from_text(text, allow_cloud=request.allow_cloud)
    result.source_hash = checksum
    result.page_count = len(pages)
    return result


@router.post("/normalize", response_model=NormalizeResponse)
def normalize_skills(request: NormalizeSkillRequest, services: ServicesDep):
    normalized, unmatched = [], []
    for name in request.raw_skills:
        skill = services.taxonomy.normalize(name)
        if skill:
            normalized.append(skill)
        else:
            unmatched.append(name)
    return NormalizeResponse(normalized=normalized, unmatched=unmatched)
