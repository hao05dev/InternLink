package com.internlink.core.presentation.evaluation.dto.response;

import java.math.BigDecimal;
import java.util.Map;
import java.util.UUID;

public record ComponentScoreResponse(UUID id, UUID placementId, String componentCode, BigDecimal score,
    Map<String, BigDecimal> criteriaScores, String source, UUID evidenceDocumentId, String status,
    UUID submittedByUserId, UUID verifiedByUserId) {}
