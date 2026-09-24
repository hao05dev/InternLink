package com.internlink.core.presentation.recruitment.dto.response;

import com.internlink.core.shared.enums.OfferStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.Map;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PlacementOfferResponse {

    private UUID id;
    private UUID applicationId;
    private UUID studentId;
    private String studentName;
    private String jobTitle;
    private String companyName;
    private UUID proposedMentorId;
    private String proposedMentorName;
    private LocalDate startDate;
    private LocalDate endDate;
    private BigDecimal stipend;
    private Map<String, Object> termsSnapshot;
    private OffsetDateTime expiresAt;
    private OfferStatus status;
    private OffsetDateTime respondedAt;
    private OffsetDateTime createdAt;
}