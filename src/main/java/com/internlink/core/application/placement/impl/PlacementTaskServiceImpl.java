package com.internlink.core.application.placement.impl;

import com.internlink.core.application.placement.PlacementTaskAccessPolicy;
import com.internlink.core.application.placement.PlacementTaskService;
import com.internlink.core.domain.auth.User;
import com.internlink.core.domain.placement.InternshipPlacement;
import com.internlink.core.domain.placement.PlacementTask;
import com.internlink.core.shared.security.TermGuard;
import com.internlink.core.infrastructure.persistence.jpa.JpaInternshipPlacementRepository;
import com.internlink.core.infrastructure.persistence.jpa.JpaPlacementTaskRepository;
import com.internlink.core.infrastructure.persistence.jpa.JpaUserRepository;
import com.internlink.core.presentation.placement.dto.request.PlacementTaskRequest;
import com.internlink.core.presentation.placement.dto.response.PlacementTaskResponse;
import com.internlink.core.shared.enums.PlacementStatus;
import com.internlink.core.shared.enums.TaskStatus;
import com.internlink.core.shared.enums.UserRole;
import com.internlink.core.shared.exception.BadRequestException;
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
    private final com.internlink.core.application.system.notification
                    .PlacementWorkflowNotificationHelper
            notifications;

    @Override
    @Transactional(readOnly = true)
    public List<PlacementTaskResponse> getTasksByPlacement(UUID actorId, UUID placementId) {
        User actor = userRepository.findById(actorId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", actorId));
        InternshipPlacement placement = placementRepository.findById(placementId)
                .orElseThrow(() -> new ResourceNotFoundException("InternshipPlacement", "id", placementId));

        PlacementTaskAccessPolicy.requireCanView(actor, placement);

        return taskRepository.findByPlacementId(placementId).stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public PlacementTaskResponse getTaskById(UUID actorId, UUID id) {
        User actor = userRepository.findById(actorId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", actorId));
        PlacementTask task = taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("PlacementTask", "id", id));

        PlacementTaskAccessPolicy.requireCanView(actor, task.getPlacement());
        return mapToResponse(task);
    }

    @Override
    @Transactional
    public PlacementTaskResponse createTask(UUID mentorId, PlacementTaskRequest request) {
        User mentor = userRepository.findById(mentorId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", mentorId));
        InternshipPlacement placement = placementRepository.findById(request.getPlacementId())
                .orElseThrow(() -> new ResourceNotFoundException("InternshipPlacement", "id", request.getPlacementId()));

        TermGuard.requireNotClosed(placement.getTerm());
        if (placement.getStatus() != PlacementStatus.ACTIVE) {
            throw new BadRequestException("Chỉ có thể giao nhiệm vụ cho lần thực tập đang ACTIVE");
        }
        PlacementTaskAccessPolicy.requireCanCreate(mentor, placement);

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

        var saved = taskRepository.save(task);
        notifications.task(task, mentorId, "TASK_ASSIGNED");
        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public PlacementTaskResponse submitTask(UUID id, UUID studentId, String submissionSummary) {
        PlacementTask task = taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("PlacementTask", "id", id));

        TermGuard.requireNotClosed(task.getPlacement().getTerm());
        if (task.getPlacement().getStatus() != PlacementStatus.ACTIVE) {
            throw new BadRequestException("Chỉ có thể nộp nhiệm vụ cho lần thực tập đang ACTIVE");
        }
        if (task.getPlacement().getStudent() == null
                || !task.getPlacement().getStudent().getId().equals(studentId)) {
            throw new BadRequestException("Bạn không có quyền nộp nhiệm vụ này");
        }

        if (task.getStatus() != TaskStatus.ASSIGNED
                && task.getStatus() != TaskStatus.IN_PROGRESS
                && task.getStatus() != TaskStatus.REVISION_REQUIRED) {
            throw new BadRequestException("Nhiệm vụ ở trạng thái hiện tại không thể nộp");
        }
        if (submissionSummary == null || submissionSummary.isBlank()) {
            throw new BadRequestException("Nội dung báo cáo nhiệm vụ không được để trống");
        }

        task.setSubmissionSummary(submissionSummary.trim());
        task.setStatus(TaskStatus.SUBMITTED);
        task.setSubmittedAt(OffsetDateTime.now());

        var saved = taskRepository.save(task);
        notifications.task(task, studentId, "TASK_SUBMITTED");
        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public PlacementTaskResponse reviewTask(
            UUID id,
            UUID reviewerId,
            TaskStatus status,
            String mentorFeedback,
            Integer progressPercent) {
        User reviewer = userRepository.findById(reviewerId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", reviewerId));
        PlacementTask task = taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("PlacementTask", "id", id));

        TermGuard.requireNotClosed(task.getPlacement().getTerm());
        if (task.getPlacement().getStatus() != PlacementStatus.ACTIVE) {
            throw new BadRequestException("Chỉ có thể đánh giá nhiệm vụ cho lần thực tập đang ACTIVE");
        }
        PlacementTaskAccessPolicy.requireCanReview(reviewer, task);

        if (task.getStatus() != TaskStatus.SUBMITTED) {
            throw new BadRequestException("Chỉ có thể đánh giá nhiệm vụ đã SUBMITTED");
        }
        if (status != TaskStatus.COMPLETED && status != TaskStatus.REVISION_REQUIRED) {
            throw new BadRequestException(
                    "Kết quả đánh giá chỉ có thể là COMPLETED hoặc REVISION_REQUIRED");
        }
        if (progressPercent != null && (progressPercent < 0 || progressPercent > 100)) {
            throw new BadRequestException("Tiến độ nhiệm vụ phải nằm trong khoảng 0 đến 100");
        }

        task.setStatus(status);
        task.setMentorFeedback(mentorFeedback);
        if (progressPercent != null) {
            task.setProgressPercent(progressPercent);
        }
        task.setReviewedAt(OffsetDateTime.now());

        var saved = taskRepository.save(task);
        notifications.task(task, reviewerId, "TASK_REVIEWED");
        return mapToResponse(saved);
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
