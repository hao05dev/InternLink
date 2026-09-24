package com.internlink.core.presentation.placement.dto.response;

import com.internlink.core.shared.enums.TaskStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PlacementTaskResponse {

    private UUID id;
    private UUID placementId;
    private UUID assignedByMentorId;
    private String assignedByMentorName;
    private String title;
    private String description;
    private List<String> learningOutcomes;
    private OffsetDateTime dueAt;
    private Integer progressPercent;
    private TaskStatus status;
    private String submissionSummary;
    private String mentorFeedback;
    private OffsetDateTime submittedAt;
    private OffsetDateTime reviewedAt;
    private OffsetDateTime createdAt;
}