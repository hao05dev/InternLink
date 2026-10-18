"""Composition helpers. AI decisions remain inside the FastAPI service."""
import base64

from demo.client import AiServiceClient, ApiResult


def extract_text(client: AiServiceClient, text: str, allow_cloud: bool) -> ApiResult:
    return client.post("/api/v1/skills/extract", {
        "text": text, "source_type": "cv", "allow_cloud": allow_cloud,
    })


def extract_file(client: AiServiceClient, name: str, content: bytes, allow_cloud: bool) -> ApiResult:
    return client.post("/api/v1/skills/extract-document", {
        "filename": name,
        "content_base64": base64.b64encode(content).decode("ascii"),
        "allow_cloud": allow_cloud,
    })


def rank_jobs(client: AiServiceClient, accepted_skill_ids: list[str], jobs: list[dict]) -> ApiResult:
    allowed = {"id", "title", "company_name", "mandatory_skill_ids", "optional_skill_ids", "description"}
    jobs = [{key: value for key, value in job.items() if key in allowed} for job in jobs]
    return client.post("/api/v1/matching/rank-jobs", {
        "student": {"id": "demo-candidate", "skill_ids": accepted_skill_ids, "bio_summary": ""},
        "jobs": jobs,
    })


def accepted_by_default(extraction: dict) -> list[str]:
    return [row["id"] for row in extraction.get("normalized_skills", [])
            if row.get("assertion_status") == "mentioned"]
