package com.internlink.core.presentation.placement.dto.response;

import com.internlink.core.shared.enums.IntroductionLetterStatus;
import java.time.OffsetDateTime;
import java.util.UUID;

public record IntroductionLetterResponse(
        UUID id,
        UUID studentId,
        String studentName,
        String studentCode,
        UUID termId,
        String termName,
        String targetCompanyName,
        String targetPosition,
        String reason,
        IntroductionLetterStatus status,
        String issuedCode,
        String issueNote,
        String processedByName,
        OffsetDateTime processedAt,
        OffsetDateTime receivedAt,
        OffsetDateTime createdAt
) {}
