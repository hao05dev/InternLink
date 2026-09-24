package com.internlink.core.presentation.placement.dto.response;

import com.internlink.core.shared.enums.AgreementStatus;
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
public class LearningAgreementResponse {

    private UUID id;
    private UUID offerId;
    private UUID studentId;
    private String studentName;
    private UUID companyId;
    private String companyName;
    private UUID departmentId;
    private String departmentName;
    private Integer targetCredits;
    private String learningObjectives;
    private AgreementStatus status;
    private Map<String, Object> studentSignature;
    private Map<String, Object> companySignature;
    private Map<String, Object> facultySignature;
    private UUID documentId;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
}