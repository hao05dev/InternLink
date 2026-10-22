package com.internlink.core.domain.ai_matching;

import java.util.List;
import java.util.UUID;

public record EmbeddingCacheEntry(
    String subjectType,
    UUID subjectId,
    String sourceHash,
    String sourceVersion,
    String task,
    String model,
    String modelRevision,
    int dimension,
    String chunkPolicy,
    List<Double> embedding
) {}
