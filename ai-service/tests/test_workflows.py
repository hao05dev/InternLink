import base64
import io
import json
import zipfile
from pathlib import Path
import pytest
from fastapi.testclient import TestClient
from pydantic import SecretStr
from pypdf import PdfWriter
from app.main import create_app
from app.evaluation.runner import evaluate
from app.evaluation.retrieval import bm25_scores, jaccard
from app.schemas.matching import StudentProfileDTO, JobDTO
from app.services.ranking_service import RankingService
from app.services.skill_service import SkillService


def document(client, name, data):
    return client.post("/api/v1/skills/extract-document", json={
        "filename": name, "content_base64": base64.b64encode(data).decode(),
    })


def test_document_roundtrip_preserves_hash_and_evidence(client):
    import hashlib
    source = "Tôi dùng Java.\nTôi chưa biết Docker.".encode()
    response = document(client, "cv.txt", source)
    assert response.status_code == 200
    payload = response.json()
    assert payload["source_hash"] == hashlib.sha256(source).hexdigest()
    assert payload["page_count"] == 1
    rows = {row["id"]: row for row in payload["normalized_skills"]}
    assert rows["SK-DOCKER"]["assertion_status"] == "negated"
    for row in rows.values():
        evidence = row["evidence"]
        assert source.decode()[evidence["start"]:evidence["end"]] == evidence["quote"]


def test_docx_text_and_entity_rejection(client):
    def archive(xml):
        buffer = io.BytesIO()
        with zipfile.ZipFile(buffer, "w") as out:
            out.writestr("word/document.xml", xml)
        return buffer.getvalue()
    valid = b'<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body><w:p><w:r><w:t>Java</w:t></w:r></w:p></w:body></w:document>'
    assert document(client, "cv.docx", archive(valid)).json()["normalized_skills"][0]["id"] == "SK-JAVA"
    assert document(client, "cv.docx", archive(b'<!DOCTYPE doc []><doc/>')).status_code == 422


def test_pdf_scan_and_encryption_have_actionable_errors(client):
    pdf = PdfWriter()
    pdf.add_blank_page(width=100, height=100)
    buffer = io.BytesIO()
    pdf.write(buffer)
    assert document(client, "cv.pdf", buffer.getvalue()).json()["detail"] == "ocr_required"
    pdf.encrypt("password")
    buffer = io.BytesIO()
    pdf.write(buffer)
    assert document(client, "cv.pdf", buffer.getvalue()).json()["detail"] == "encrypted_pdf"


@pytest.mark.parametrize("name,data", [("cv.exe", b"Java"), ("cv.pdf", b"not pdf"), ("cv.txt", b"")])
def test_malformed_documents_rejected(client, name, data):
    assert document(client, name, data).status_code == 422


def test_cloud_requires_explicit_request_consent(application):
    class NeverCalled:
        def extract(self, text):
            raise AssertionError("CV must stay local without consent")
    service = SkillService(application.state.services.taxonomy, NeverCalled())
    assert service.extract_skills_from_text("Java").mode == "rule_based"


def test_learning_and_positive_mentions(application):
    service = application.state.services.skills
    learning = service.extract_skills_from_text("Tôi đang học Docker.").normalized_skills[0]
    assert learning.assertion_status == "learning"
    positive = service.extract_skills_from_text("Tôi chưa biết Docker. Tôi dùng Docker trong dự án.").normalized_skills[0]
    assert positive.assertion_status == "mentioned"


def test_job_requirements_and_checklist(client):
    response = client.post("/api/v1/skills/extract", json={"text": "Bắt buộc Java. Ưu tiên Docker.", "source_type": "jd"}).json()
    assert {s["id"]: s["requirement_type"] for s in response["normalized_skills"]} == {"SK-JAVA": "mandatory", "SK-DOCKER": "optional"}
    review = client.post("/api/v1/assistance/job-review", json={"description": "Thực hiện mọi công việc."}).json()
    assert {row["code"] for row in review["issues"]} == {"missing_learning_outcomes", "missing_location", "missing_work_format", "vague_tasks"}
    assert review["requires_review"]


def test_journal_claims_keep_source_and_skip_negation(client):
    response = client.post("/api/v1/assistance/journal-summary", json={"entries": [
        {"id": "week-1", "version": "hash1", "text": "Dùng Java. Chưa biết Docker.", "verification": "self_reported"}
    ]}).json()
    assert len(response["claims"]) == 1
    assert response["claims"][0]["entry_id"] == "week-1"
    assert response["claims"][0]["source_version"] == "hash1"
    assert response["claims"][0]["verification"] == "self_reported"


def test_learning_plan_unknown_and_limits(client):
    assert client.post("/api/v1/assistance/learning-plan", json={"skill_ids": ["fabricated"]}).status_code == 422
    assert client.post("/api/v1/assistance/learning-plan", json={"skill_ids": ["SK-JAVA"], "hours_per_week": 0}).status_code == 422
    plan = client.post("/api/v1/assistance/learning-plan", json={"skill_ids": ["SK-JAVA"]}).json()
    assert plan["mode"] == "template"
    assert plan["requires_review"] and plan["tasks"][0]["skill_id"] == "SK-JAVA"


def test_learning_plan_respects_total_weekly_budget(client):
    plan = client.post("/api/v1/assistance/learning-plan", json={
        "skill_ids": ["SK-JAVA", "SK-DOCKER", "SK-PYTHON"], "hours_per_week": 4,
    }).json()
    assert sum(task["estimated_hours"] for task in plan["tasks"]) == pytest.approx(4)


def test_local_embedding_does_not_download_missing_weights(tmp_path):
    from app.providers.local_e5 import LocalE5Provider
    from app.core.errors import ProviderUnavailable
    provider = LocalE5Provider(str(tmp_path / "missing"), "test-revision")
    with pytest.raises(ProviderUnavailable) as error:
        provider.embed("Java", "retrieval_query")
    assert error.value.code == "local_model_missing"


def test_service_key_protects_inference_but_not_liveness(config):
    config.SERVICE_API_KEY = SecretStr("test-service-key")
    with TestClient(create_app(config)) as client:
        assert client.get("/").status_code == 200
        assert client.post("/api/v1/skills/extract", json={"text": "Java"}).status_code == 401
        assert client.post("/api/v1/skills/extract", json={"text": "Java"},
                           headers={"X-InternLink-AI-Key": "test-service-key"}).status_code == 200


def test_real_text_baselines():
    assert jaccard("Java Docker", "Docker Java") == 1
    scores = bm25_scores("Java", ["Java Java Spring", "React CSS", "SQL"])
    assert scores[0] > scores[1] == scores[2]


def test_shared_java_python_fallback_contract():
    cases = json.loads((Path(__file__).parent / "fixtures/ranking_contract.json").read_text())
    for case in cases:
        result = RankingService().rank_job_for_student(
            StudentProfileDTO(id="student", skill_ids=case["student"]),
            JobDTO(id="job", title="Job", mandatory_skill_ids=case["mandatory"], optional_skill_ids=case["optional"]))
        assert result.match_percentage == case["percentage"]
        assert result.score_available == case["available"]
        assert not result.semantic_available


def test_runner_does_not_invent_dense_results():
    jobs = [{"id": str(i), "title": "Java" if i == 0 else "SQL", "mandatory_skill_ids": ["SK-JAVA"] if i == 0 else []} for i in range(5)]
    dataset = {"split": "synthetic", "provenance": "unit-test", "queries": [{
        "student": {"id": "s", "skill_ids": ["SK-JAVA"], "bio_summary": "Java"},
        "jobs": jobs, "judgments": {str(i): 2 if i == 0 else 0 for i in range(5)}
    }]}
    report = evaluate(dataset)
    assert report["synthetic"]
    assert set(report["results"]) == {"Jaccard", "BM25", "Skill_Only"}
    assert report["results"]["BM25"]["metrics"]["nDCG@5"] == 1
    dataset["queries"][0]["judgments"].pop("4")
    with pytest.raises(ValueError, match="must be judged"):
        evaluate(dataset)


def test_parse_query_natural_language_intent(client):
    response = client.post("/api/v1/assistance/parse-query", json={
        "query": "intern python tại các ngân hàng Cần Thơ có hỗ trợ lương"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["parsed"] is True
    assert "Python" in data["extracted_skills"]
    assert data["suggested_role_level"] == "INTERN"
    assert data["suggested_location"] == "Cần Thơ"
    assert data["suggested_industry"] == "Ngân hàng"
    assert data["requires_stipend"] is True
    assert "Python" in data["cleaned_keywords"]
    assert "Cần Thơ" in data["summary_message"]
    assert "Ngân hàng" in data["summary_message"]

