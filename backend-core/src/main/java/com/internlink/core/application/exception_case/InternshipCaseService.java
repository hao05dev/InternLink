package com.internlink.core.application.exception_case;

import com.internlink.core.presentation.exception_case.dto.request.InternshipCaseRequest;
import com.internlink.core.presentation.exception_case.dto.response.InternshipCaseResponse;
import com.internlink.core.shared.enums.CaseStatus;

import java.util.List;
import java.util.Map;
import java.util.UUID;

public interface InternshipCaseService {
    List<InternshipCaseResponse> getCasesByPlacement(UUID placementId);
    List<InternshipCaseResponse> getCasesByStatus(CaseStatus status);
    InternshipCaseResponse getCaseById(UUID id);
    InternshipCaseResponse reportCase(UUID reporterId, InternshipCaseRequest request);
    InternshipCaseResponse resolveCase(UUID id, UUID resolverId, CaseStatus status, Map<String, Object> resolution);
}