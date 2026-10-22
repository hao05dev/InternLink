package com.internlink.core.application.placement;

import com.internlink.core.presentation.placement.dto.request.PlacementTaskRequest;
import com.internlink.core.presentation.placement.dto.response.PlacementTaskResponse;
import com.internlink.core.shared.enums.TaskStatus;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

public interface PlacementTaskService {
    List<PlacementTaskResponse> getTasksByPlacement(UUID actorId, UUID placementId);
    PlacementTaskResponse getTaskById(UUID actorId, UUID id);
    PlacementTaskResponse createTask(UUID mentorId, PlacementTaskRequest request);
    PlacementTaskResponse submitTask(UUID id, UUID studentId, String submissionSummary);
    PlacementTaskResponse reviewTask(UUID id, UUID reviewerId, TaskStatus status, String mentorFeedback, Integer progressPercent);
    PlacementTaskResponse reopenTask(UUID id, UUID mentorId, String reasonNote, OffsetDateTime newDueAt);
}
