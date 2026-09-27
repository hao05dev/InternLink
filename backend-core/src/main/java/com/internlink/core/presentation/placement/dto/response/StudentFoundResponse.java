package com.internlink.core.presentation.placement.dto.response;

import java.time.LocalDate;
import java.util.UUID;

public record StudentFoundResponse(UUID id, UUID termId, UUID studentId, String hostName,
    String hostAddress, String contactName, String contactEmail, String workDescription,
    LocalDate startDate, LocalDate endDate, UUID acceptanceDocumentId,
    String status, String reviewNote, UUID placementId) {}
