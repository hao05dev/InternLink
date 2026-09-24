package com.internlink.core.presentation.evaluation.dto.response;

import com.internlink.core.shared.enums.ResultStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.Map;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FinalResultResponse {

    private UUID id;
    private UUID placementId;
    private String studentName;
    private String studentCode;
    private String companyName;
    private BigDecimal mentorScore;
    private BigDecimal lecturerScore;
    private BigDecimal complianceScore;
    private Map<String, Object> componentBreakdown;
    private BigDecimal finalScore;
    private ResultStatus resultStatus;
    private UUID decidedByUserId;
    private String decidedByName;
    private OffsetDateTime publishedAt;
    private OffsetDateTime finalizedAt;
    private OffsetDateTime createdAt;
}