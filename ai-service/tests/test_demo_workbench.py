import base64
import json
from pathlib import Path

from demo.client import ApiResult
from demo.jobs import DEMO_JOBS
from demo.job_source import _strip_html
from demo.presenters import optional_missing, ranking_rows, skill_review_rows
from demo.workflow import accepted_by_default, extract_file, rank_jobs


class RecordingClient:
    def __init__(self):
        self.path = None
        self.payload = None

    def post(self, path, payload):
        self.path = path
        self.payload = payload
        return ApiResult({"ok": True}, 200, 1.0)


def test_demo_jobs_are_unique_and_use_taxonomy_ids():
    taxonomy_file = Path(__file__).parents[1] / "app" / "data" / "esco_it_skills.json"
    taxonomy_ids = {row["id"] for row in json.loads(taxonomy_file.read_text(encoding="utf-8"))}
    assert len(DEMO_JOBS) == 6
    assert len({job["id"] for job in DEMO_JOBS}) == len(DEMO_JOBS)
    for job in DEMO_JOBS:
        assert set(job["mandatory_skill_ids"] + job["optional_skill_ids"]) <= taxonomy_ids


def test_file_upload_is_base64_and_keeps_cloud_consent():
    recorder = RecordingClient()
    extract_file(recorder, "cv.txt", b"Java SQL", True)
    assert recorder.path == "/api/v1/skills/extract-document"
    assert base64.b64decode(recorder.payload["content_base64"]) == b"Java SQL"
    assert recorder.payload["allow_cloud"] is True


def test_rank_payload_contains_all_jobs_and_only_api_fields():
    recorder = RecordingClient()
    rank_jobs(recorder, ["SK-JAVA", "SK-SQL"], DEMO_JOBS)
    assert recorder.path == "/api/v1/matching/rank-jobs"
    assert recorder.payload["student"]["skill_ids"] == ["SK-JAVA", "SK-SQL"]
    assert len(recorder.payload["jobs"]) == 6
    assert all("location" not in job and "work_format" not in job for job in recorder.payload["jobs"])


def test_human_review_defaults_to_positive_mentions_only():
    extraction = {"normalized_skills": [
        {"id": "SK-JAVA", "assertion_status": "mentioned"},
        {"id": "SK-AWS", "assertion_status": "learning"},
        {"id": "SK-DOCKER", "assertion_status": "negated"},
    ]}
    assert accepted_by_default(extraction) == ["SK-JAVA"]


def test_skill_review_rows_keep_evidence_and_safe_defaults():
    extraction = {"normalized_skills": [
        {"id": "SK-JAVA", "name": "Java", "assertion_status": "mentioned", "evidence": {"quote": "Dùng Java"}},
        {"id": "SK-AWS", "name": "AWS", "assertion_status": "learning", "evidence": {"quote": "Đang học AWS"}},
    ]}
    rows = skill_review_rows(extraction)
    assert rows[0]["Chọn"] is True and rows[0]["Dẫn chứng"] == "Dùng Java"
    assert rows[1]["Chọn"] is False and rows[1]["Đánh giá"] == "Đang học"


def test_ranking_rows_are_sorted_for_compact_table():
    payload = {"rankings": [
        {"job_id": "demo-python", "job_title": "B", "company_name": "B Co", "match_percentage": 20, "score_available": True,
         "matched_skills": [], "missing_skills": ["SK-JAVA"]},
        {"job_id": "demo-java-backend", "job_title": "A", "company_name": "A Co", "match_percentage": 90, "score_available": True,
         "matched_skills": ["SK-JAVA"], "missing_skills": []},
    ]}
    rows = ranking_rows(payload, DEMO_JOBS)
    assert [row["Vị trí"] for row in rows] == ["A", "B"]
    assert rows[0]["Phù hợp"] == 90 and rows[0]["Đã khớp"] == "Java"
    assert optional_missing(payload["rankings"][1], DEMO_JOBS) == ["SK-DOCKER", "SK-GIT"]


def test_database_job_html_is_safely_reduced_to_plain_text():
    assert _strip_html("<h2>Yêu cầu &amp; quyền lợi</h2><ul><li>Java</li><li>Git</li></ul>") == (
        "Yêu cầu & quyền lợi Java Git"
    )
