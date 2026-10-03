"""Run with: python -m app.evaluation.runner dataset.json --output report.json"""
import argparse
import hashlib
import json
from pathlib import Path
from statistics import mean

from app.evaluation.metrics import mrr, ndcg_at_k, precision_at_k, recall_at_k
from app.evaluation.retrieval import bm25_scores, jaccard
from app.schemas.matching import JobDTO, StudentProfileDTO
from app.services.ranking_service import RankingService


def evaluate(dataset):
    if dataset.get("split") not in ("development", "validation", "test", "synthetic"):
        raise ValueError("Dataset must declare split and provenance")
    if not dataset.get("provenance"):
        raise ValueError("Dataset provenance is required")
    samples = dataset["queries"]
    if not samples:
        raise ValueError("Empty evaluation dataset")
    results = {}
    for sample in samples:
        student = StudentProfileDTO.model_validate(sample["student"])
        jobs = [JobDTO.model_validate(job) for job in sample["jobs"]]
        truth = sample["judgments"]
        if len({job.id for job in jobs}) != len(jobs) or set(truth) != {job.id for job in jobs}:
            raise ValueError("All unique candidates must be judged")
        if any(type(value) is not int or value not in (0, 1, 2) for value in truth.values()):
            raise ValueError("Judgments must be integer 0/1/2")
        if len(jobs) < 5:
            raise ValueError("At least 5 candidates required for evaluation at K=5")
        query = student.bio_summary or " ".join(student.skill_ids)
        documents = [(job.title + " " + (job.description or "")) for job in jobs]
        ranked = [RankingService().rank_job_for_student(student, job) for job in jobs]
        methods = {
            "Jaccard": [jaccard(query, doc) for doc in documents],
            "BM25": bm25_scores(query, documents),
            "Skill_Only": [row.skill_score for row in ranked],
        }
        if all(row.semantic_available for row in ranked):
            methods["Dense_Semantic"] = [row.semantic_score for row in ranked]
            methods["Hybrid"] = [row.final_score for row in ranked]
        for method, scores in methods.items():
            order = sorted(range(len(jobs)), key=lambda index: (-scores[index], jobs[index].id))
            relevance = [truth[jobs[index].id] for index in order]
            flags = [value >= 1 for value in relevance]
            results.setdefault(method, []).append({
                "nDCG@5": ndcg_at_k(relevance, 5), "P@5": precision_at_k(flags, 5),
                "Recall@5": recall_at_k(flags, 5), "MRR": mrr(flags),
            })
    return {
        "split": dataset["split"], "provenance": dataset["provenance"],
        "synthetic": dataset["split"] == "synthetic", "query_count": len(samples),
        "gain": "2^relevance-1", "relevant_threshold": 1,
        "semantic_policy": "only queries with real compatible supplied vectors",
        "results": {
            method: {"evaluated_queries": len(rows), "metrics": {
                key: mean(row[key] for row in rows) for key in rows[0]
            }} for method, rows in results.items()
        },
    }


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("dataset", type=Path)
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()
    raw = args.dataset.read_bytes()
    result = evaluate(json.loads(raw))
    result["dataset_sha256"] = hashlib.sha256(raw).hexdigest()
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding="utf-8")


if __name__ == "__main__":
    main()
