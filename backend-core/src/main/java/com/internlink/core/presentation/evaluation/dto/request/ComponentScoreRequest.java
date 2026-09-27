package com.internlink.core.presentation.evaluation.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.util.Map;
import java.util.UUID;

public record ComponentScoreRequest(@NotNull UUID placementId, @NotBlank String componentCode,
    BigDecimal score, Map<String, BigDecimal> criteriaScores, UUID evidenceDocumentId,
    @NotNull String source) {}
