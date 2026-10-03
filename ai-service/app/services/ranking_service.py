"""Deterministic ranking. No HTTP, SDK, database, or model initialization."""
import math

from app.schemas.matching import JobDTO, MatchResult, StudentProfileDTO


class RankingService:
    def calculate_skill_score(self, student_skill_ids, mandatory_ids, optional_ids):
        student, mandatory = set(student_skill_ids), set(mandatory_ids)
        optional = set(optional_ids) - mandatory
        matched = student & (mandatory | optional)
        missing = mandatory - student
        mandatory_score = len(student & mandatory) / len(mandatory) if mandatory else 0.0
        optional_score = len(student & optional) / len(optional) if optional else 0.0
        score = (
            0.8 * mandatory_score + 0.2 * optional_score
            if mandatory and optional else mandatory_score if mandatory else optional_score
        )
        return score, sorted(matched), sorted(missing)

    def cosine_similarity(self, left, right):
        if len(left) != len(right) or not left:
            raise ValueError("Embedding dimensions must match")
        if not all(math.isfinite(v) for v in [*left, *right]):
            raise ValueError("Embedding values must be finite")
        # Scale before normalization to avoid overflow from large supplied values.
        left_scale, right_scale = max(map(abs, left)), max(map(abs, right))
        if not left_scale or not right_scale:
            raise ValueError("Embedding cannot be zero")
        a, b = [v / left_scale for v in left], [v / right_scale for v in right]
        denominator = math.sqrt(sum(v * v for v in a)) * math.sqrt(sum(v * v for v in b))
        return max(0.0, min(1.0, sum(x * y for x, y in zip(a, b)) / denominator))

    def rank_job_for_student(self, student: StudentProfileDTO, job: JobDTO) -> MatchResult:
        skill, matched, missing = self.calculate_skill_score(
            student.skill_ids, job.mandatory_skill_ids, job.optional_skill_ids,
        )
        warnings = []
        skill_available = bool(student.skill_ids) and bool(job.mandatory_skill_ids or job.optional_skill_ids)
        if not student.skill_ids:
            warnings.append("student_skills_unknown")
        if not job.mandatory_skill_ids and not job.optional_skill_ids:
            warnings.append("job_skills_unknown")
        semantic, semantic_available = 0.0, False
        if student.embedding is not None and job.embedding is not None:
            if student.embedding_model != job.embedding_model:
                warnings.append("embedding_model_mismatch")
            elif len(student.embedding) != len(job.embedding):
                warnings.append("embedding_dimension_mismatch")
            else:
                semantic = self.cosine_similarity(student.embedding, job.embedding)
                semantic_available = True
        if not semantic_available:
            warnings.append("semantic_unavailable")
        if skill_available and semantic_available:
            # Renormalize the existing skill/semantic weights; academic defaults removed.
            score, mode = (0.55 * skill + 0.35 * semantic) / 0.9, "hybrid"
        elif skill_available:
            score, mode = skill, "skill_only"
        elif semantic_available:
            score, mode = semantic, "semantic_only"
        else:
            score, mode = 0.0, "insufficient_data"

        if mode == "insufficient_data":
            recommendation = "Chưa đủ dữ liệu để tính điểm phù hợp; hãy bổ sung hồ sơ hoặc yêu cầu vị trí."
        elif not job.mandatory_skill_ids:
            recommendation = "JD chưa có kỹ năng bắt buộc để đối chiếu; điểm hiện tại chỉ mang tính tham khảo."
        elif not student.skill_ids:
            recommendation = "Hồ sơ chưa có kỹ năng đã xác nhận; cần rà soát trước khi đối chiếu yêu cầu."
        elif missing:
            recommendation = "Chưa thấy minh chứng đã xác nhận cho các kỹ năng: " + ", ".join(missing) + "."
        else:
            recommendation = "Các kỹ năng bắt buộc đã có trong hồ sơ xác nhận; cần xem thêm điều kiện của vị trí."
        return MatchResult(
            job_id=job.id, job_title=job.title, company_name=job.company_name,
            final_score=round(score, 4), match_percentage=round(score * 100, 1),
            skill_score=round(skill, 4), semantic_score=round(semantic, 4),
            matched_skills=matched, missing_skills=missing, recommendation=recommendation,
            mode=mode, score_available=mode != "insufficient_data",
            semantic_available=semantic_available, warnings=warnings,
        )
