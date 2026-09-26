package com.internlink.core.application.placement;

import com.internlink.core.presentation.placement.dto.request.PlacementTaskRequest;
import com.internlink.core.presentation.placement.dto.response.PlacementTaskResponse;
import com.internlink.core.shared.enums.TaskStatus;

import java.util.List;
import java.util.UUID;

public interface PlacementTaskService {
    List<PlacementTaskResponse> getTasksByPlacement(UUID placementId);
    PlacementTaskResponse getTaskById(UUID id);
    PlacementTaskResponse createTask(UUID mentorId, PlacementTaskRequest request);
    PlacementTaskResponse submitTask(UUID id, UUID studentId, String submissionSummary);
    PlacementTaskResponse reviewTask(UUID id, UUID reviewerId, TaskStatus status, String mentorFeedback, Integer progressPercent);
}
