import pytest
from sklearn.ensemble import RandomForestRegressor

from app.schemas.matching import JobDTO, StudentProfileDTO
from app.services.feature_extractor import FEATURE_NAMES, FeatureExtractor
from app.services.ltr_ranking_service import LTRRankingService


def test_feature_extractor_coverage_and_vector():
    fe = FeatureExtractor()
    mand, opt = fe.compute_skill_coverages(["Java", "Docker"], ["Java", "SQL"], ["Docker", "Git"])
    assert mand == 0.5
    assert opt == 0.5

    major_fit = fe.compute_major_alignment("Kỹ thuật phần mềm", "Kỹ thuật phần mềm")
    assert major_fit == 1.0
    major_mismatch = fe.compute_major_alignment("Kinh tế đối ngoại", "Công nghệ thông tin")
    assert major_mismatch == 0.2

    student = StudentProfileDTO(
        id="s1",
        major="Công nghệ thông tin",
        skill_ids=["Java", "Docker"],
        bio_summary="Sinh viên năm 4 chuyên ngành phần mềm, có kinh nghiệm làm việc với Java và Docker.",
    )
    job = JobDTO(
        id="j1",
        title="Thực tập sinh Java Backend",
        target_major="Công nghệ thông tin",
        mandatory_skill_ids=["Java", "Spring Boot"],
        optional_skill_ids=["Docker"],
        description="Tuyển thực tập sinh backend phát triển microservice Java, Spring Boot và container Docker.",
    )
    features = fe.extract_features(student, job, semantic_score=0.85)
    assert set(features.keys()) == set(FEATURE_NAMES)
    assert features["mandatory_skill_coverage"] == 0.5
    assert features["optional_skill_coverage"] == 1.0
    assert features["dense_semantic_score"] == 0.85
    assert features["major_alignment"] == 1.0

    vec = fe.to_vector(features)
    assert len(vec) == 6
    assert all(isinstance(v, float) for v in vec)


def test_ltr_ranking_service_deterministic():
    service = LTRRankingService()
    student = StudentProfileDTO(
        id="s1",
        major="Software Engineering",
        skill_ids=["Java", "Spring Boot"],
        bio_summary="Backend developer proficient in Java",
    )
    job = JobDTO(
        id="j1",
        title="Java Engineer Intern",
        target_major="Software Engineering",
        mandatory_skill_ids=["Java", "Spring Boot"],
        description="Looking for Java intern",
    )
    result = service.rank_job_for_student(student, job)
    assert result.score_available is True
    assert result.algorithm_version == "ltr-ml-v1"
    assert result.final_score > 0.5
    assert "Java" in result.matched_skills


def test_ltr_ranking_service_with_sklearn_model():
    fe = FeatureExtractor()
    # Train a minimal dummy RandomForestRegressor on 4 synthetic vectors
    X = [
        [1.0, 1.0, 0.9, 0.8, 1.0, 0.7],
        [0.0, 0.0, 0.1, 0.1, 0.2, 0.1],
        [0.5, 0.5, 0.6, 0.5, 1.0, 0.4],
        [0.8, 0.0, 0.7, 0.6, 0.8, 0.5],
    ]
    y = [0.95, 0.05, 0.60, 0.75]
    rf = RandomForestRegressor(n_estimators=5, random_state=42)
    rf.fit(X, y)

    service = LTRRankingService(model=rf)
    student = StudentProfileDTO(
        id="s1",
        skill_ids=["Java", "Spring Boot"],
        bio_summary="Java developer",
    )
    job = JobDTO(
        id="j1",
        title="Java Intern",
        mandatory_skill_ids=["Java", "Spring Boot"],
        description="Java intern opening",
    )
    result = service.rank_job_for_student(student, job)
    assert result.score_available is True
    assert 0.0 <= result.final_score <= 1.0
