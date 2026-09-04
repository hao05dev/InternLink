from fastapi import APIRouter
from app.services.benchmark_service import benchmark_service

router = APIRouter(prefix="/api/v1/benchmarks", tags=["Thesis Evaluation Benchmarks"])

@router.get("/run-sample-evaluation")
def run_sample_evaluation():
    # Sample synthetic queries with ground-truth judgments
    sample_data = [
        {
            "query_student_id": "STU-001",
            "ground_truth": {"JOB-JAVA": 2, "JOB-FULLSTACK": 1, "JOB-PYTHON-AI": 0, "JOB-MOBILE": 0},
            "candidate_jobs": [
                {"id": "JOB-JAVA", "jaccard_score": 0.60, "semantic_score": 0.88, "skill_score": 0.90, "hybrid_score": 0.89},
                {"id": "JOB-FULLSTACK", "jaccard_score": 0.40, "semantic_score": 0.75, "skill_score": 0.70, "hybrid_score": 0.72},
                {"id": "JOB-PYTHON-AI", "jaccard_score": 0.20, "semantic_score": 0.50, "skill_score": 0.20, "hybrid_score": 0.35},
                {"id": "JOB-MOBILE", "jaccard_score": 0.10, "semantic_score": 0.30, "skill_score": 0.10, "hybrid_score": 0.20},
            ]
        },
        {
            "query_student_id": "STU-002",
            "ground_truth": {"JOB-REACT": 2, "JOB-FRONTEND": 2, "JOB-JAVA": 0, "JOB-DEVOPS": 0},
            "candidate_jobs": [
                {"id": "JOB-REACT", "jaccard_score": 0.70, "semantic_score": 0.91, "skill_score": 0.95, "hybrid_score": 0.93},
                {"id": "JOB-FRONTEND", "jaccard_score": 0.50, "semantic_score": 0.82, "skill_score": 0.80, "hybrid_score": 0.81},
                {"id": "JOB-JAVA", "jaccard_score": 0.10, "semantic_score": 0.40, "skill_score": 0.15, "hybrid_score": 0.25},
                {"id": "JOB-DEVOPS", "jaccard_score": 0.20, "semantic_score": 0.45, "skill_score": 0.20, "hybrid_score": 0.30},
            ]
        }
    ]
    return benchmark_service.run_ablation_experiment(sample_data)
