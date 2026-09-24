package com.internlink.core.application.placement.impl;

import com.internlink.core.application.placement.PlacementTaskService;
import com.internlink.core.domain.auth.User;
import com.internlink.core.domain.placement.InternshipPlacement;
import com.internlink.core.domain.placement.PlacementTask;
import com.internlink.core.infrastructure.persistence.jpa.JpaInternshipPlacementRepository;
import com.internlink.core.infrastructure.persistence.jpa.JpaPlacementTaskRepository;
import com.internlink.core.infrastructure.persistence.jpa.JpaUserRepository;
import com.internlink.core.presentation.placement.dto.request.PlacementTaskRequest;
import com.internlink.core.presentation.placement.dto.response.PlacementTaskResponse;
import com.internlink.core.shared.enums.TaskStatus;
import com.internlink.core.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PlacementTaskServiceImpl implements PlacementTaskService {

    private final JpaPlacementTaskRepository taskRepository;
    private final JpaInternshipPlacementRepository placementRepository;
    private final JpaUserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public List<PlacementTaskResponse> getTasksByPlacement(UUID placementId) {
        return taskRepository.findByPlacementId(placementId).stream()
            .map(this::mapToResponse)
            .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public PlacementTaskResponse getTaskById(UUID id) {
        PlacementTask task = taskRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("PlacementTask", "id", id));
        return mapToResponse(task);
    }

    @Override
    @Transactional
    public PlacementTaskResponse createTask(UUID mentorId, PlacementTaskRequest request) {
        InternshipPlacement placement = placementRepository.findById(request.getPlacementId())
            .orElseThrow(() -> new ResourceNotFoundException("InternshipPlacement", "id", request.getPlacementId()));

        User mentor = userRepository.findById(mentorId)
            .orElseThrow(() -> new ResourceNotFoundException("User", "id", mentorId));

        PlacementTask task = PlacementTask.builder()
            .placement(placement)
            .assignedByMentor(mentor)
            .title(request.getTitle().trim())
            .description(request.getDescription().trim())
            .learningOutcomes(request.getLearningOutcomes() != null ? request.getLearningOutcomes() : List.of())
            .dueAt(request.getDueAt())
            .progressPercent(request.getProgressPercent() != null ? request.getProgressPercent() : 0)
            .status(TaskStatus.ASSIGNED)
            .build();

        return mapToResponse(taskRepository.save(task));
    }

    @Override
    @Transactional
    public PlacementTaskResponse submitTask(UUID id, String submissionSummary) {
        PlacementTask task = taskRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("PlacementTask", "id", id));

        task.setSubmissionSummary(submissionSummary);
        task.setStatus(TaskStatus.SUBMITTED);
        task.setSubmittedAt(OffsetDateTime.now());

        return mapToResponse(taskRepository.save(task));
    }

    @Override
    @Transactional
    public PlacementTaskResponse reviewTask(UUID id, TaskStatus status, String mentorFeedback, Integer progressPercent) {
        PlacementTask task = taskRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("PlacementTask", "id", id));

        task.setStatus(status);
        task.setMentorFeedback(mentorFeedback);
        if (progressPercent != null) {
            task.setProgressPercent(progressPercent);
        }
        task.setReviewedAt(OffsetDateTime.now());

        return mapToResponse(taskRepository.save(task));
    }

    private PlacementTaskResponse mapToResponse(PlacementTask entity) {
        return PlacementTaskResponse.builder()
            .id(entity.getId())
            .placementId(entity.getPlacement().getId())
            .assignedByMentorId(entity.getAssignedByMentor().getId())
            .assignedByMentorName(entity.getAssignedByMentor().getFullName())
            .title(entity.getTitle())
            .description(entity.getDescription())
            .learningOutcomes(entity.getLearningOutcomes())
            .dueAt(entity.getDueAt())
            .progressPercent(entity.getProgressPercent())
            .status(entity.getStatus())
            .submissionSummary(entity.getSubmissionSummary())
            .mentorFeedback(entity.getMentorFeedback())
            .submittedAt(entity.getSubmittedAt())
            .reviewedAt(entity.getReviewedAt())
            .createdAt(entity.getCreatedAt())
            .build();
    }
}