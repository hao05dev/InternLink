package com.internlink.core.infrastructure.integration.ai;

import java.util.List;

public record AiEmbeddingResult(
    String id,
    List<Double> embedding,
    String model,
    String modelRevision,
    int dimension,
    String task,
    String sourceHash,
    String chunkPolicy
) {}
