"""Metrics for fully judged, precomputed scores, not an end-to-end experiment."""
import math
from statistics import mean

from app.evaluation.metrics import dcg_at_k, mrr, ndcg_at_k, precision_at_k, recall_at_k


class BenchmarkService:
    dcg_at_k = staticmethod(dcg_at_k)
    ndcg_at_k = staticmethod(ndcg_at_k)
    precision_at_k = staticmethod(precision_at_k)
    mrr = staticmethod(mrr)

    def run_ablation_experiment(self, dataset):
        methods = {
            "Keyword_Jaccard": "jaccard_score", "Dense_Semantic": "semantic_score",
            "Skill_Only": "skill_score", "Proposed_Hybrid": "hybrid_score",
        }
        results = {method: [] for method in methods}
        for sample in dataset:
            jobs, truth = sample["candidate_jobs"], sample["ground_truth"]
            ids = [job["id"] for job in jobs]
            if len(set(ids)) != len(ids) or set(ids) != set(truth):
                raise ValueError("Every unique candidate must have a judgment, and vice versa")
            if any(value not in (0, 1, 2) for value in truth.values()):
                raise ValueError("Relevance must be 0, 1 or 2")
            for method, key in methods.items():
                if any(key not in job or not math.isfinite(job[key]) for job in jobs):
                    raise ValueError("All method scores must be provided and finite")
                ordered = sorted(jobs, key=lambda job: (-job[key], job["id"]))
                rel = [truth[job["id"]] for job in ordered]
                flags = [value >= 1 for value in rel]
                results[method].append({
                    "P@1": precision_at_k(flags, 1), "P@3": precision_at_k(flags, 3),
                    "P@5": precision_at_k(flags, 5), "Recall@5": recall_at_k(flags, 5),
                    "MRR": mrr(flags), "nDCG@3": ndcg_at_k(rel, 3), "nDCG@5": ndcg_at_k(rel, 5),
                })
        return {
            "total_test_queries": len(dataset),
            "evaluation_kind": "precomputed_scores",
            "gain": "2^relevance-1",
            "zero_relevant_policy": "metrics_zero_included_in_mean",
            "benchmark_summary": {
                method: {key: round(mean(row[key] for row in rows), 4) for key in rows[0]} if rows else {}
                for method, rows in results.items()
            },
        }
