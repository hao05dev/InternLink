import numpy as np
from typing import List, Dict, Any

class BenchmarkService:
    @staticmethod
    def dcg_at_k(r: List[int], k: int) -> float:
        r = np.asfarray(r)[:k]
        if r.size:
            return np.sum(r / np.log2(np.arange(2, r.size + 2)))
        return 0.0

    @staticmethod
    def ndcg_at_k(r: List[int], k: int) -> float:
        dcg_max = BenchmarkService.dcg_at_k(sorted(r, reverse=True), k)
        if not dcg_max:
            return 0.0
        return BenchmarkService.dcg_at_k(r, k) / dcg_max

    @staticmethod
    def precision_at_k(relevant_flags: List[bool], k: int) -> float:
        sub = relevant_flags[:k]
        if not sub:
            return 0.0
        return sum(sub) / float(k)

    @staticmethod
    def mrr(relevant_flags: List[bool]) -> float:
        for idx, flag in enumerate(relevant_flags):
            if flag:
                return 1.0 / (idx + 1)
        return 0.0

    def run_ablation_experiment(self, test_dataset: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Thực hiện so sánh 4 mô hình:
        1. Jaccard Keyword Matching
        2. Vector Semantic Similarity Only
        3. Skill-Only Matching
        4. Proposed Hybrid Matching (Skill + Semantic + Academic)
        """
        methods = ["Keyword_Jaccard", "Dense_Semantic", "Skill_Only", "Proposed_Hybrid"]
        results = {m: {"P@1": [], "P@3": [], "P@5": [], "MRR": [], "nDCG@3": [], "nDCG@5": []} for m in methods}

        for query_sample in test_dataset:
            # relevance judgment: dict of job_id -> ground_truth_relevance (0, 1, 2)
            # 2 = very relevant, 1 = relevant, 0 = irrelevant
            ground_truth = query_sample["ground_truth"]
            jobs = query_sample["candidate_jobs"]

            for m in methods:
                # Rank jobs by method
                if m == "Keyword_Jaccard":
                    scored_jobs = sorted(jobs, key=lambda j: j.get("jaccard_score", 0), reverse=True)
                elif m == "Dense_Semantic":
                    scored_jobs = sorted(jobs, key=lambda j: j.get("semantic_score", 0), reverse=True)
                elif m == "Skill_Only":
                    scored_jobs = sorted(jobs, key=lambda j: j.get("skill_score", 0), reverse=True)
                else: # Proposed_Hybrid
                    scored_jobs = sorted(jobs, key=lambda j: j.get("hybrid_score", 0), reverse=True)

                relevances = [ground_truth.get(j["id"], 0) for j in scored_jobs]
                binary_rel = [r > 0 for r in relevances]

                results[m]["P@1"].append(BenchmarkService.precision_at_k(binary_rel, 1))
                results[m]["P@3"].append(BenchmarkService.precision_at_k(binary_rel, 3))
                results[m]["P@5"].append(BenchmarkService.precision_at_k(binary_rel, 5))
                results[m]["MRR"].append(BenchmarkService.mrr(binary_rel))
                results[m]["nDCG@3"].append(BenchmarkService.ndcg_at_k(relevances, 3))
                results[m]["nDCG@5"].append(BenchmarkService.ndcg_at_k(relevances, 5))

        # Compute mean averages
        summary = {}
        for m in methods:
            summary[m] = {
                metric: round(float(np.mean(vals)), 4) if vals else 0.0
                for metric, vals in results[m].items()
            }

        return {
            "total_test_queries": len(test_dataset),
            "benchmark_summary": summary
        }

benchmark_service = BenchmarkService()
