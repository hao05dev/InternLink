"""Offline weighted-feature baseline; this is not a trained LTR model."""
from app.schemas.matching import JobDTO, MatchResult, StudentProfileDTO
from app.services.feature_extractor import FeatureExtractor
from app.services.ranking_service import RankingService


BASELINE_WEIGHTS = {
    "mandatory_skill_coverage": 0.45,
    "optional_skill_coverage": 0.15,
    "dense_semantic_score": 0.20,
    "bm25_lexical_score": 0.10,
    "major_alignment": 0.05,
    "jaccard_overlap": 0.05,
}


class WeightedFeatureRankingService:
    """Combines hand-authored weights for offline ablation experiments only."""

    def __init__(
        self,
        base_ranking: RankingService | None = None,
        feature_extractor: FeatureExtractor | None = None,
    ):
        self.base_ranking = base_ranking or RankingService()
        self.feature_extractor = feature_extractor or FeatureExtractor()

    def predict_score(self, features: dict[str, float]) -> float:
        score = sum(features.get(name, 0.0) * weight for name, weight in BASELINE_WEIGHTS.items())
        return max(0.0, min(1.0, score))

    def rank_job_for_student(self, student: StudentProfileDTO, job: JobDTO) -> MatchResult:
        base_result = self.base_ranking.rank_job_for_student(student, job)
        if not base_result.score_available:
            return base_result

        features = self.feature_extractor.extract_features(
            student=student,
            job=job,
            semantic_score=base_result.semantic_score if base_result.semantic_available else 0.0,
        )
        score = self.predict_score(features)
        if features["mandatory_skill_coverage"] >= 0.8:
            recommendation = "Hồ sơ đáp ứng phần lớn kỹ năng bắt buộc."
        elif features["mandatory_skill_coverage"] >= 0.5:
            recommendation = "Hồ sơ phù hợp một phần; cần rà soát kỹ năng bắt buộc còn thiếu."
        else:
            recommendation = "Chưa có đủ minh chứng cho phần lớn kỹ năng bắt buộc."

        return MatchResult(
            job_id=job.id,
            job_title=job.title,
            company_name=job.company_name,
            final_score=round(score, 4),
            match_percentage=round(score * 100, 1),
            skill_score=base_result.skill_score,
            semantic_score=base_result.semantic_score,
            academic_score=round(features["major_alignment"], 4),
            matched_skills=base_result.matched_skills,
            missing_skills=base_result.missing_skills,
            recommendation=recommendation,
            mode="hybrid" if base_result.semantic_available else "skill_only",
            score_available=True,
            semantic_available=base_result.semantic_available,
            algorithm_version="weighted-features-baseline-v1",
            warnings=[*base_result.warnings, "offline_untrained_baseline"],
        )
