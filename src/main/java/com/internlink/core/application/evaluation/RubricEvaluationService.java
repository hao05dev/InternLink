package com.internlink.core.application.evaluation;

import com.internlink.core.presentation.evaluation.dto.request.RubricEvaluationRequest;
import com.internlink.core.presentation.evaluation.dto.response.RubricEvaluationResponse;

import java.util.List;
import java.util.UUID;

public interface RubricEvaluationService {
    List<RubricEvaluationResponse> getEvaluationsByPlacement(UUID placementId);
    RubricEvaluationResponse getEvaluationById(UUID id);
    RubricEvaluationResponse submitEvaluation(UUID evaluatorId, RubricEvaluationRequest request);
}