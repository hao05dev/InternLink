package com.internlink.core.presentation.placement.dto.response;

import com.internlink.core.shared.enums.PlacementStatus;
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
public class InternshipPlacementResponse {

    private UUID id;
    private UUID agreementId;
    private UUID studentId;
    private String studentName;
    private String studentCode;
    private UUID companyId;
    private String companyName;
    private UUID mentorId;
    private String mentorName;
    private UUID lecturerId;
    private String lecturerName;
    private UUID termId;
    private String termName;
    private Map<String, Object> workSchedule;
    private LocalDate startDate;
    private LocalDate endDate;
    private BigDecimal totalHoursWorked;
    private PlacementStatus status;
    private OffsetDateTime createdAt;
}