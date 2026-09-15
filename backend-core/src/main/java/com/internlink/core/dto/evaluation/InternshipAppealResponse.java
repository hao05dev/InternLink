package com.internlink.core.dto.evaluation;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InternshipAppealResponse {

    private Long id;
    private Long learningAgreementId;
    private Long studentUserId;
    private String studentName;
    private String appealType;
    private String title;
    private String content;
    private String evidenceUrl;
    private String status;
    private String responseContent;
    private Long handledByUserId;
    private String handledByName;
    private LocalDateTime createdAt;
    private LocalDateTime resolvedAt;
}
