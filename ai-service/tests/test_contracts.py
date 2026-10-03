import pytest
from fastapi.testclient import TestClient

from app.main import create_app


def payload():
    return {
        "student": {"id": "s1", "skill_ids": ["SK-JAVA"], "bio_summary": "Java project"},
        "jobs": [{
            "id": "j1", "title": "Java intern", "description": "Java Docker",
            "mandatory_skill_ids": ["SK-JAVA", "SK-DOCKER"], "optional_skill_ids": [],
        }],
    }


def test_java_health_contract_and_no_false_provider_readiness(client):
    data = client.get("/").json()
    assert data["status"] == "healthy"
    assert data["gemini_api_configured"] is False
    assert data["extraction_model"] == "rule-based-extraction"
    assert data["embedding_model"] == "disabled"
    assert data["capabilities"]["provider_connectivity"] == "not_probed"


def test_java_extract_contract_preserves_original_offsets(client):
    source = "  Tôi làm Java và SQL.  "
    response = client.post("/api/v1/skills/extract", json={"text": source})
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "COMPLETED"
    assert data["mode"] == "rule_based"
    assert "SK-JAVA" in {skill["id"] for skill in data["normalized_skills"]}
    for skill in data["normalized_skills"]:
        evidence = skill["evidence"]
        assert source[evidence["start"]:evidence["end"]] == evidence["quote"]
        assert skill["requires_confirmation"] is True


def test_java_rank_contract_without_cloud_or_fake_academic_score(client):
    response = client.post("/api/v1/matching/rank-jobs", json=payload())
    assert response.status_code == 200
    data = response.json()
    assert data["total_ranked"] == 1
    row = data["rankings"][0]
    assert row["match_percentage"] == 50
    assert row["academic_score"] == 0
    assert row["matched_skills"] == ["SK-JAVA"]
    assert row["missing_skills"] == ["SK-DOCKER"]
    assert row["mode"] == "skill_only"
    assert row["semantic_available"] is False


def test_unavailable_embedding_returns_503_not_a_fake_vector(client):
    response = client.post("/api/v1/matching/embedding", json={"text": "Java"})
    assert response.status_code == 503
    assert response.json() == {"detail": {"code": "embedding_disabled"}}


@pytest.mark.parametrize("text", ["", "   ", "x" * 100001], ids=["empty", "blank", "too-long"])
def test_invalid_text_is_rejected_without_echoing_document(client, text):
    response = client.post("/api/v1/skills/extract", json={"text": text})
    assert response.status_code == 422
    assert all("input" not in item for item in response.json()["detail"])


def test_duplicate_jobs_rejected(client):
    request = payload()
    request["jobs"] *= 2
    assert client.post("/api/v1/matching/rank-jobs", json=request).status_code == 422


def test_vectors_require_model_provenance(client):
    request = payload()
    request["student"]["embedding"] = [1, 0]
    assert client.post("/api/v1/matching/rank-jobs", json=request).status_code == 422


@pytest.mark.parametrize("vector", [[0, 0], [float("inf"), 1]])
def test_vector_validation_without_http_json_nonfinite(vector):
    from pydantic import ValidationError
    from app.schemas.matching import StudentProfileDTO
    with pytest.raises(ValidationError):
        StudentProfileDTO(id="s", skill_ids=[], embedding=vector, embedding_model="m")


def test_sample_benchmark_disabled_by_default(client):
    assert client.get("/api/v1/benchmarks/run-sample-evaluation").status_code == 404


def test_sample_benchmark_explicitly_labelled(config):
    config.ENABLE_SAMPLE_BENCHMARK = True
    with TestClient(create_app(config)) as client:
        result = client.get("/api/v1/benchmarks/run-sample-evaluation")
        assert result.status_code == 200
        assert result.json()["is_demo"] is True
        assert result.json()["evaluation_kind"] == "precomputed_scores"


def test_taxonomy_is_not_advertised_as_verified_esco(client):
    result = client.get("/api/v1/skills/taxonomy").json()
    assert result["count"] == len(result["skills"]) == 49
    assert "mapping pending" in result["source"]


def test_no_wildcard_cors_by_default(client):
    response = client.options("/api/v1/skills/extract", headers={
        "Origin": "https://untrusted.example", "Access-Control-Request-Method": "POST",
    })
    assert "access-control-allow-origin" not in response.headers


def test_openapi_contains_typed_request_and_response(client):
    schema = client.get("/openapi.json").json()
    assert "MatchResult" in schema["components"]["schemas"]
    assert "ExtractSkillResponse" in schema["components"]["schemas"]
