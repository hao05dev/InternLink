from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Dict, Any
from app.services.skill_service import skill_service

router = APIRouter(prefix="/api/v1/skills", tags=["Skills"])

class ExtractSkillRequest(BaseModel):
    text: str

class NormalizeSkillRequest(BaseModel):
    raw_skills: List[str]

@router.get("/taxonomy")
def get_taxonomy():
    return {
        "count": len(skill_service.skills_taxonomy),
        "skills": skill_service.skills_taxonomy
    }

@router.post("/extract")
def extract_skills(request: ExtractSkillRequest):
    result = skill_service.extract_skills_from_text(request.text)
    return result

@router.post("/normalize")
def normalize_skills(request: NormalizeSkillRequest):
    normalized = []
    unmatched = []
    for raw in request.raw_skills:
        match = skill_service.normalize_skill(raw)
        if match:
            normalized.append(match)
        else:
            unmatched.append(raw)
    return {
        "normalized": normalized,
        "unmatched": unmatched
    }
