import pytest

from app.evaluation.benchmark import BenchmarkService
from app.evaluation.metrics import dcg_at_k, mrr, ndcg_at_k, precision_at_k, recall_at_k


def test_metrics_against_hand_calculated_values():
    assert dcg_at_k([2, 0, 1], 3) == 3.5
    assert ndcg_at_k([2, 1, 0], 3) == 1
    assert ndcg_at_k([0, 2, 1], 3) < 1
    assert precision_at_k([True, False, True], 5) == 0.4
    assert recall_at_k([True, False, True], 1) == 0.5
    assert mrr([False, True]) == 0.5
    assert ndcg_at_k([0, 0], 2) == 0


def test_missing_judgments_are_not_assumed_irrelevant():
    with pytest.raises(ValueError, match="judgment"):
        BenchmarkService().run_ablation_experiment([
            {"candidate_jobs": [{"id": "j"}], "ground_truth": {}},
        ])


def test_missing_method_scores_are_not_assumed_zero():
    with pytest.raises(ValueError, match="scores"):
        BenchmarkService().run_ablation_experiment([
            {"candidate_jobs": [{"id": "j"}], "ground_truth": {"j": 1}},
        ])
