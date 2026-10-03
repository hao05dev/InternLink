"""Transparent lexical baselines; same candidate corpus for every query."""
import math
import re
import unicodedata
from collections import Counter


def tokenize(text):
    return re.findall(r"[\w]+(?:[+#]+)?", unicodedata.normalize("NFC", text).casefold())


def jaccard(query, document):
    q, d = set(tokenize(query)), set(tokenize(document))
    return len(q & d) / len(q | d) if q or d else 0.0


def bm25_scores(query, documents, k1=1.5, b=0.75):
    corpus = [tokenize(text) for text in documents]
    if not corpus:
        return []
    average = sum(map(len, corpus)) / len(corpus) or 1
    terms = set(tokenize(query))
    frequencies = Counter(term for document in corpus for term in set(document))
    scores = []
    for document in corpus:
        counts, score = Counter(document), 0.0
        for term in terms:
            tf = counts[term]
            if not tf:
                continue
            idf = math.log(1 + (len(corpus) - frequencies[term] + 0.5) / (frequencies[term] + 0.5))
            score += idf * tf * (k1 + 1) / (tf + k1 * (1 - b + b * len(document) / average))
        scores.append(score)
    return scores
