import pytest

from app.schemas.matching import JobDTO, RankJobsRequest, StudentProfileDTO
from app.services.matching_service import MatchingService
from app.services.ranking_service import RankingService


def test_no_requirements_does_not_claim_full_match():
    result = RankingService().rank_job_for_student(
        StudentProfileDTO(id="s", skill_ids=["Java"]),
        JobDTO(id="j", title="Intern", mandatory_skill_ids=[]),
    )
    assert result.mode == "insufficient_data"
    assert result.score_available is False
    assert result.match_percentage == 0


def test_missing_student_skills_is_unknown_not_a_negative_assessment():
    result = RankingService().rank_job_for_student(
        StudentProfileDTO(id="s", skill_ids=[]),
        JobDTO(id="j", title="Intern", mandatory_skill_ids=["Java"]),
    )
    assert result.score_available is False
    assert "student_skills_unknown" in result.warnings


@pytest.mark.parametrize("other_model,vector,warning", [
    ("other", [1, 0], "embedding_model_mismatch"),
    ("same", [1, 0, 0], "embedding_dimension_mismatch"),
])
def test_incompatible_vectors_do_not_affect_score(other_model, vector, warning):
    result = RankingService().rank_job_for_student(
        StudentProfileDTO(id="s", skill_ids=["Java"], embedding=[1, 0], embedding_model="same"),
        JobDTO(id="j", title="Intern", mandatory_skill_ids=["Java"], embedding=vector, embedding_model=other_model),
    )
    assert result.mode == "skill_only"
    assert warning in result.warnings
    assert result.final_score == 1


def test_hybrid_uses_real_vectors_and_ignores_gpa():
    student = StudentProfileDTO(id="s", skill_ids=["Java"], embedding=[1, 0], embedding_model="same", gpa=0)
    job = JobDTO(id="j", title="Intern", mandatory_skill_ids=["Java"], embedding=[0, 1], embedding_model="same")
    scorer = RankingService()
    result = scorer.rank_job_for_student(student, job)
    assert result.final_score == pytest.approx(0.6111)
    assert result.mode == "hybrid"
    student.gpa = 4
    assert scorer.rank_job_for_student(student, job).final_score == result.final_score


def test_skills_are_sets_and_required_optional_overlap_is_not_double_counted():
    score, matched, missing = RankingService().calculate_skill_score(
        ["Java", "Java"], ["Java", "Docker", "Docker"], ["Java"],
    )
    assert score == 0.5
    assert matched == ["Java"]
    assert missing == ["Docker"]


def test_stable_tie_order_and_empty_batch():
    service = MatchingService(RankingService())
    student = StudentProfileDTO(id="s", skill_ids=["Java"])
    jobs = [JobDTO(id=id, title=id, mandatory_skill_ids=["Java"]) for id in ["z", "a"]]
    assert [r.job_id for r in service.rank_jobs(RankJobsRequest(student=student, jobs=jobs)).rankings] == ["a", "z"]
    assert service.rank_jobs(RankJobsRequest(student=student, jobs=[])).total_ranked == 0


def test_large_finite_vectors_do_not_overflow():
    assert RankingService().cosine_similarity([1e308, 1e308], [1e308, 1e308]) == pytest.approx(1)
