package com.internlink.core.presentation.exception_case.dto.response;

import com.internlink.core.shared.enums.CaseSeverity;
import com.internlink.core.shared.enums.CaseStatus;
import com.internlink.core.shared.enums.CaseType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.Map;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InternshipCaseResponse {

    private UUID id;
    private UUID placementId;
    private String studentName;
    private String companyName;
    private CaseType caseType;
    private UUID reportedByUserId;
    private String reportedByName;
    private UUID assignedToUserId;
    private String assignedToName;
    private CaseSeverity severity;
    private String summary;
    private Map<String, Object> detail;
    private Map<String, Object> resolution;
    private CaseStatus status;
    private OffsetDateTime openedAt;
    private OffsetDateTime resolvedAt;
}