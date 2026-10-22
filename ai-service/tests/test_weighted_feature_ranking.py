from app.schemas.matching import JobDTO, StudentProfileDTO
from app.services.feature_extractor import FEATURE_NAMES, FeatureExtractor
from app.services.weighted_feature_ranking_service import WeightedFeatureRankingService


def test_feature_extractor_coverage_and_vector():
    extractor = FeatureExtractor()
    mandatory, optional = extractor.compute_skill_coverages(
        ["Java", "Docker"], ["Java", "SQL"], ["Docker", "Git"]
    )
    assert mandatory == 0.5
    assert optional == 0.5

    student = StudentProfileDTO(
        id="s1", major="Công nghệ thông tin", skill_ids=["Java", "Docker"],
        bio_summary="Sinh viên có kinh nghiệm Java và Docker.",
    )
    job = JobDTO(
        id="j1", title="Thực tập sinh Java", target_major="Công nghệ thông tin",
        mandatory_skill_ids=["Java", "Spring Boot"], optional_skill_ids=["Docker"],
        description="Phát triển backend Java và Docker.",
    )
    features = extractor.extract_features(student, job, semantic_score=0.85)
    assert set(features) == set(FEATURE_NAMES)
    assert features["mandatory_skill_coverage"] == 0.5
    assert features["optional_skill_coverage"] == 1.0
    assert features["dense_semantic_score"] == 0.85
    assert len(extractor.to_vector(features)) == len(FEATURE_NAMES)


def test_weighted_feature_baseline_is_explicitly_untrained():
    service = WeightedFeatureRankingService()
    student = StudentProfileDTO(
        id="s1", major="Software Engineering", skill_ids=["Java", "Spring Boot"],
        bio_summary="Backend developer proficient in Java",
    )
    job = JobDTO(
        id="j1", title="Java Engineer Intern", target_major="Software Engineering",
        mandatory_skill_ids=["Java", "Spring Boot"], description="Looking for Java intern",
    )

    result = service.rank_job_for_student(student, job)

    assert result.score_available is True
    assert result.algorithm_version == "weighted-features-baseline-v1"
    assert "offline_untrained_baseline" in result.warnings
    assert result.final_score > 0.5
