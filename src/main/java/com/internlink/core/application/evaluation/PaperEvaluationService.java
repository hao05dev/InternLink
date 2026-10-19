package com.internlink.core.application.evaluation;

import com.internlink.core.presentation.evaluation.dto.request.PaperEvaluationOverrideRequest;
import com.internlink.core.presentation.evaluation.dto.response.RubricEvaluationResponse;

import java.util.UUID;

public interface PaperEvaluationService {
    RubricEvaluationResponse savePaperEvaluation(UUID actorUserId, PaperEvaluationOverrideRequest request);
}
