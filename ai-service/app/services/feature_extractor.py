"""Feature extractor for offline ranking experiments.

Transforms StudentProfileDTO and JobDTO into normalized feature vectors
for transparent weighted-feature baselines.
"""
from app.evaluation.retrieval import bm25_scores, jaccard
from app.schemas.matching import JobDTO, StudentProfileDTO


FEATURE_NAMES = [
    "mandatory_skill_coverage",
    "optional_skill_coverage",
    "dense_semantic_score",
    "bm25_lexical_score",
    "major_alignment",
    "jaccard_overlap",
]


class FeatureExtractor:
    def compute_skill_coverages(
        self, student_skills: list[str], mandatory_skills: list[str], optional_skills: list[str]
    ) -> tuple[float, float]:
        student = set(student_skills)
        mandatory = set(mandatory_skills)
        optional = set(optional_skills) - mandatory

        mandatory_cov = len(student & mandatory) / len(mandatory) if mandatory else 0.0
        optional_cov = len(student & optional) / len(optional) if optional else 0.0
        return mandatory_cov, optional_cov

    def compute_major_alignment(self, student_major: str | None, target_major: str | None) -> float:
        if not target_major or not student_major:
            return 0.5  # Neutral / general fit
        s_clean = student_major.strip().casefold()
        t_clean = target_major.strip().casefold()
        if s_clean == t_clean or t_clean in s_clean or s_clean in t_clean:
            return 1.0
        # Partial match on common domain words (e.g., 'CNTT', 'IT', 'Software', 'Khoa học máy tính')
        s_tokens = set(s_clean.split())
        t_tokens = set(t_clean.split())
        return 0.8 if (s_tokens & t_tokens) else 0.2

    def extract_features(
        self,
        student: StudentProfileDTO,
        job: JobDTO,
        semantic_score: float = 0.0,
    ) -> dict[str, float]:
        mand_cov, opt_cov = self.compute_skill_coverages(
            student.skill_ids, job.mandatory_skill_ids, job.optional_skill_ids
        )
        major_fit = self.compute_major_alignment(student.major, job.target_major)

        student_text = (student.bio_summary or "") + " " + " ".join(student.skill_ids)
        job_text = job.title + " " + (job.description or "") + " " + " ".join(job.mandatory_skill_ids)

        jaccard_score = jaccard(student_text, job_text)
        bm25_raw = bm25_scores(student_text, [job_text])
        # Sigmoid-normalized BM25 to keep within [0.0, 1.0]
        bm25_score = 1.0 / (1.0 + (2.71828 ** (-bm25_raw[0] / 3.0))) if bm25_raw else 0.0

        return {
            "mandatory_skill_coverage": round(mand_cov, 4),
            "optional_skill_coverage": round(opt_cov, 4),
            "dense_semantic_score": round(max(0.0, min(1.0, semantic_score)), 4),
            "bm25_lexical_score": round(bm25_score, 4),
            "major_alignment": round(major_fit, 4),
            "jaccard_overlap": round(jaccard_score, 4),
        }

    def to_vector(self, features: dict[str, float]) -> list[float]:
        return [features.get(name, 0.0) for name in FEATURE_NAMES]
