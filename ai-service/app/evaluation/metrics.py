import math


def dcg_at_k(relevances, k):
    if k < 1:
        raise ValueError("k must be positive")
    return sum((2 ** relevance - 1) / math.log2(rank + 2) for rank, relevance in enumerate(relevances[:k]))


def ndcg_at_k(relevances, k):
    ideal = dcg_at_k(sorted(relevances, reverse=True), k)
    return dcg_at_k(relevances, k) / ideal if ideal else 0.0


def precision_at_k(flags, k):
    if k < 1:
        raise ValueError("k must be positive")
    # Fixed K denominator; missing result positions count as non-relevant.
    return sum(flags[:k]) / k


def recall_at_k(flags, k):
    if k < 1:
        raise ValueError("k must be positive")
    total = sum(flags)
    return sum(flags[:k]) / total if total else 0.0


def mrr(flags):
    return next((1 / rank for rank, relevant in enumerate(flags, 1) if relevant), 0.0)
