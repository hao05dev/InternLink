package com.internlink.core.presentation.recruitment.dto.response;

import com.internlink.core.shared.enums.ApplicationStatus;
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
public class JobApplicationResponse {

    private UUID id;
    private UUID jobId;
    private String jobTitle;
    private String companyName;
    private UUID studentId;
    private String studentName;
    private String studentEmail;
    private UUID submittedCvDocumentId;
    private String coverLetter;
    private Map<String, Object> aiMatchDetail;
    private ApplicationStatus status;
    private OffsetDateTime submittedAt;
    private OffsetDateTime updatedAt;
}