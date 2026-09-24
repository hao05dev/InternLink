package com.internlink.core.presentation.placement.dto.response;

import com.internlink.core.shared.enums.LogbookStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WeeklyLogbookResponse {

    private UUID id;
    private UUID placementId;
    private Integer weekNumber;
    private LocalDate periodStart;
    private LocalDate periodEnd;
    private String tasksCompleted;
    private String learningReflection;
    private BigDecimal totalHours;
    private LogbookStatus status;
    private String mentorFeedback;
    private UUID mentorReviewedBy;
    private OffsetDateTime mentorReviewedAt;
    private String lecturerComment;
    private UUID lecturerCommentedBy;
    private OffsetDateTime lecturerCommentedAt;
    private OffsetDateTime submittedAt;
    private OffsetDateTime createdAt;
}