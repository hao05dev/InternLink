from typing import List, Dict, Any, Tuple
import numpy as np

class RankingService:
    def __init__(self, alpha: float = 0.55, beta: float = 0.35, gamma: float = 0.10):
        # α: Trọng số kỹ năng cụ thể
        # β: Trọng số độ tương đồng ngữ nghĩa toàn văn
        # γ: Trọng số học lực / chuyên ngành / điểm thưởng
        self.alpha = alpha
        self.beta = beta
        self.gamma = gamma

    def cosine_similarity(self, vec1: List[float], vec2: List[float]) -> float:
        v1 = np.array(vec1, dtype=np.float32)
        v2 = np.array(vec2, dtype=np.float32)
        norm1 = np.linalg.norm(v1)
        norm2 = np.linalg.norm(v2)
        if norm1 == 0 or norm2 == 0:
            return 0.0
        dot = np.dot(v1, v2)
        return float(np.clip(dot / (norm1 * norm2), 0.0, 1.0))

    def calculate_skill_score(
        self,
        student_skill_ids: List[str],
        job_mandatory_skill_ids: List[str],
        job_optional_skill_ids: List[str]
    ) -> Tuple[float, List[str], List[str]]:
        student_set = set(student_skill_ids)
        mandatory_set = set(job_mandatory_skill_ids)
        optional_set = set(job_optional_skill_ids)

        # Kỹ năng bắt buộc khớp và thiếu
        matched_mandatory = student_set.intersection(mandatory_set)
        missing_mandatory = mandatory_set.difference(student_set)

        # Kỹ năng mong muốn khớp
        matched_optional = student_set.intersection(optional_set)

        # Trọng số tính điểm: Bắt buộc chiếm 80%, mong muốn chiếm 20%
        mand_score = len(matched_mandatory) / len(mandatory_set) if mandatory_set else 1.0
        opt_score = len(matched_optional) / len(optional_set) if optional_set else 1.0

        skill_score = (mand_score * 0.8) + (opt_score * 0.2)
        all_matched = list(matched_mandatory.union(matched_optional))
        all_missing = list(missing_mandatory)

        return float(np.clip(skill_score, 0.0, 1.0)), all_matched, all_missing

    def rank_job_for_student(
        self,
        student: Dict[str, Any],
        job: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Tính điểm và sinh giải thích chi tiết cho 1 cặp Sinh viên - Vị trí thực tập
        """
        student_skills = student.get("skill_ids", [])
        job_mandatory = job.get("mandatory_skill_ids", [])
        job_optional = job.get("optional_skill_ids", [])

        # 1. Tính điểm kỹ năng
        skill_score, matched_skills, missing_skills = self.calculate_skill_score(
            student_skills, job_mandatory, job_optional
        )

        # 2. Tính điểm tương đồng ngữ nghĩa (pgvector / Gemini embeddings)
        student_vec = student.get("embedding", [])
        job_vec = job.get("embedding", [])
        semantic_score = self.cosine_similarity(student_vec, job_vec) if student_vec and job_vec else 0.5

        # 3. Điểm học lực / Chuyên ngành
        academic_score = 1.0
        if job.get("target_major") and student.get("major"):
            if job["target_major"].lower() not in student["major"].lower():
                academic_score *= 0.7
        gpa = student.get("gpa", 3.0)
        # Chuẩn hóa GPA thang 4
        gpa_score = np.clip(gpa / 4.0, 0.0, 1.0)
        academic_score = (academic_score * 0.5) + (gpa_score * 0.5)

        # 4. Final Hybrid Score
        final_score = (self.alpha * skill_score) + (self.beta * semantic_score) + (self.gamma * academic_score)
        final_percentage = round(final_score * 100, 1)

        # 5. Khuyến nghị & Giải thích (Explainability)
        recommendation = ""
        if len(missing_skills) == 0:
            recommendation = "Hồ sơ của bạn đáp ứng đầy đủ tất cả kỹ năng yêu cầu! Rất khuyến khích ứng tuyển."
        elif len(missing_skills) <= 2:
            recommendation = f"Bạn đáp ứng phần lớn yêu cầu. Cần ôn tập hoặc bổ sung kiến thức về: {', '.join(missing_skills)}."
        else:
            recommendation = f"Vị trí này đòi hỏi thêm một số kỹ năng chuyên sâu: {', '.join(missing_skills[:3])}."

        return {
            "job_id": job.get("id"),
            "job_title": job.get("title"),
            "company_name": job.get("company_name"),
            "final_score": round(final_score, 4),
            "match_percentage": final_percentage,
            "skill_score": round(skill_score, 4),
            "semantic_score": round(semantic_score, 4),
            "academic_score": round(academic_score, 4),
            "matched_skills": matched_skills,
            "missing_skills": missing_skills,
            "recommendation": recommendation
        }

ranking_service = RankingService()
