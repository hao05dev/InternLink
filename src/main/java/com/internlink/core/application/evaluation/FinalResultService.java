package com.internlink.core.application.evaluation;

import com.internlink.core.presentation.evaluation.dto.request.FinalResultRequest;
import com.internlink.core.presentation.evaluation.dto.response.FinalResultResponse;

import java.util.UUID;

public interface FinalResultService {
    FinalResultResponse getFinalResultByPlacement(UUID placementId);
    FinalResultResponse calculateAndFinalizeResult(UUID decidedByUserId, FinalResultRequest request);
}