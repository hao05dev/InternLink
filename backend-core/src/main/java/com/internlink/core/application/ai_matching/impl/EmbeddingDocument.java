package com.internlink.core.application.ai_matching.impl;

import java.util.UUID;

public record EmbeddingDocument(
    String id,
    String subjectType,
    UUID subjectId,
    String sourceVersion,
    String task,
    String text
) {}
