package com.internlink.core.infrastructure.integration.ai;

public record AiEmbeddingInfo(
    boolean enabled,
    String model,
    String modelRevision,
    int dimension,
    String chunkPolicy
) {}
