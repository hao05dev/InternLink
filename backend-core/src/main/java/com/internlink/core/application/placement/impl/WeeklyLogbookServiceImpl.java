package com.internlink.core.application.placement.impl;

import com.internlink.core.application.placement.WeeklyLogbookService;
import com.internlink.core.application.system.NotificationService;
import com.internlink.core.domain.auth.User;
import com.internlink.core.domain.placement.InternshipPlacement;
import com.internlink.core.domain.placement.WeeklyLogbook;
import com.internlink.core.infrastructure.persistence.jpa.JpaInternshipPlacementRepository;
import com.internlink.core.infrastructure.persistence.jpa.JpaUserRepository;
import com.internlink.core.infrastructure.persistence.jpa.JpaWeeklyLogbookRepository;
import com.internlink.core.presentation.placement.dto.request.WeeklyLogbookRequest;
import com.internlink.core.presentation.placement.dto.response.WeeklyLogbookResponse;
import com.internlink.core.shared.enums.LogbookStatus;
import com.internlink.core.shared.enums.PlacementStatus;
import com.internlink.core.shared.enums.UserRole;
import com.internlink.core.shared.exception.BadRequestException;
import com.internlink.core.shared.exception.ResourceNotFoundException;
import com.internlink.core.shared.security.ResourceAuthorization;
import com.internlink.core.shared.security.SecurityGuard;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class WeeklyLogbookServiceImpl implements WeeklyLogbookService {

    private final JpaWeeklyLogbookRepository logbookRepository;
    private final JpaInternshipPlacementRepository placementRepository;
    private final JpaUserRepository userRepository;
    private final SecurityGuard securityGuard;
    private final NotificationService notificationService;

    @Override
    @Transactional(readOnly = true)
    public List<WeeklyLogbookResponse> getLogbooksByPlacement(UUID placementId) {
        InternshipPlacement placement = placementRepository.findById(placementId)
            .orElseThrow(() -> new ResourceNotFoundException("InternshipPlacement", "id", placementId));
        ResourceAuthorization.require(ResourceAuthorization.canReadPlacement(currentActor(), placement));
        return logbookRepository.findByPlacementIdOrderByWeekNumberAsc(placementId).stream()
            .map(this::mapToResponse)
            .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public WeeklyLogbookResponse getLogbookById(UUID id) {
        WeeklyLogbook logbook = logbookRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("WeeklyLogbook", "id", id));
        ResourceAuthorization.require(ResourceAuthorization.canReadPlacement(currentActor(), logbook.getPlacement()));
        return mapToResponse(logbook);
    }

    @Override
    @Transactional
    public WeeklyLogbookResponse submitLogbook(UUID studentId, WeeklyLogbookRequest request) {
        InternshipPlacement placement = placementRepository.findById(request.getPlacementId())
            .orElseThrow(() -> new ResourceNotFoundException("InternshipPlacement", "id", request.getPlacementId()));

        if (!placement.getStudent().getId().equals(studentId)) {
            throw new BadRequestException("Sinh viên không thuộc lần thực tập này");
        }
        if (placement.getStatus() != PlacementStatus.ACTIVE) {
            throw new BadRequestException("Chỉ có thể nộp nhật ký khi lần thực tập đang ACTIVE");
        }
        if (request.getPeriodStart().isAfter(request.getPeriodEnd())) {
            throw new BadRequestException("Ngày bắt đầu tuần phải trước hoặc bằng ngày kết thúc tuần");
        }
        if (request.getTotalHours().signum() < 0) {
            throw new BadRequestException("Tổng số giờ không thể âm");
        }

        if (request.getPeriodStart().isBefore(placement.getStartDate())
            || request.getPeriodEnd().isAfter(placement.getEndDate()))
            throw new BadRequestException("Nhật ký phải nằm trong thời gian thực tập");
        var expectedStart = placement.getStartDate().plusWeeks(request.getWeekNumber() - 1L);
        var expectedEnd = expectedStart.plusDays(6).isAfter(placement.getEndDate())
            ? placement.getEndDate() : expectedStart.plusDays(6);
        if (expectedStart.isAfter(placement.getEndDate())
            || !request.getPeriodStart().equals(expectedStart) || !request.getPeriodEnd().equals(expectedEnd))
            throw new BadRequestException("Khoảng ngày không khớp tuần thực tập số " + request.getWeekNumber());
        WeeklyLogbook logbook = logbookRepository.findByPlacementIdAndWeekNumber(request.getPlacementId(), request.getWeekNumber())
            .orElse(WeeklyLogbook.builder().placement(placement).weekNumber(request.getWeekNumber()).build());
        if (logbook.getId() != null && logbook.getStatus() != LogbookStatus.REVISION_REQUESTED)
            throw new BadRequestException("Tuần này đã nộp; chỉ được nộp lại khi có yêu cầu sửa");
        logbook.setPeriodStart(request.getPeriodStart());
        logbook.setPeriodEnd(request.getPeriodEnd());
        logbook.setTasksCompleted(request.getTasksCompleted().trim());
        logbook.setLearningReflection(request.getLearningReflection().trim());
        logbook.setTotalHours(request.getTotalHours());
        logbook.setStatus(LogbookStatus.SUBMITTED);
        logbook.setSubmittedAt(OffsetDateTime.now());
        int graceDays = placement.getAssessmentScheme() != null
            ? placement.getAssessmentScheme().getWeeklyGraceDays() : 0;
        logbook.setWasLate(logbook.getSubmittedAt().toLocalDate().isAfter(request.getPeriodEnd().plusDays(graceDays)));

        WeeklyLogbook saved = logbookRepository.save(logbook);

        // Thông báo cho Mentor (nếu có)
        if (placement.getMentor() != null) {
            notificationService.sendNotification(
                placement.getMentor().getId(),
                "LOGBOOK_SUBMITTED",
                "Sinh viên nộp nhật ký tuần " + request.getWeekNumber(),
                "Sinh viên " + placement.getStudent().getFullName() + " đã nộp nhật ký thực tập tuần " + request.getWeekNumber() + ".",
                "/mentor/weekly-evaluations"
            );
        }

        // Thông báo cho Giảng viên hướng dẫn
        if (placement.getLecturer() != null) {
            notificationService.sendNotification(
                placement.getLecturer().getId(),
                "LOGBOOK_SUBMITTED",
                "Sinh viên nộp nhật ký tuần " + request.getWeekNumber(),
                "Sinh viên " + placement.getStudent().getFullName() + " đã nộp nhật ký thực tập tuần " + request.getWeekNumber() + ".",
                "/lecturer/supervision"
            );
        }

        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public WeeklyLogbookResponse reviewByMentor(UUID id, UUID mentorUserId, LogbookStatus status, String mentorFeedback) {
        WeeklyLogbook logbook = logbookRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("WeeklyLogbook", "id", id));

        User mentor = userRepository.findById(mentorUserId)
            .orElseThrow(() -> new ResourceNotFoundException("User", "id", mentorUserId));

        if (logbook.getPlacement().getMentor() == null
            || (mentor.getRole() != UserRole.ADMIN && !logbook.getPlacement().getMentor().getId().equals(mentorUserId))) {
            throw new BadRequestException("Người dùng không phải Mentor của lần thực tập này");
        }
        if (logbook.getStatus() != LogbookStatus.SUBMITTED) {
            throw new BadRequestException("Chỉ có thể đánh giá nhật ký đang SUBMITTED");
        }
        if (status != LogbookStatus.APPROVED_BY_MENTOR && status != LogbookStatus.REVISION_REQUESTED) {
            throw new BadRequestException("Kết quả đánh giá không hợp lệ");
        }

        logbook.setStatus(status);
        logbook.setMentorFeedback(mentorFeedback != null ? mentorFeedback.trim() : null);
        logbook.setMentorReviewedBy(mentor);
        logbook.setMentorReviewedAt(OffsetDateTime.now());

        WeeklyLogbook saved = logbookRepository.save(logbook);

        // Gửi thông báo cho sinh viên
        UUID studentId = logbook.getPlacement().getStudent().getId();
        if (status == LogbookStatus.REVISION_REQUESTED) {
            notificationService.sendNotification(
                studentId,
                "LOGBOOK_REVISION_REQUESTED",
                "Yêu cầu chỉnh sửa nhật ký tuần " + logbook.getWeekNumber(),
                "Mentor yêu cầu bạn chỉnh sửa lại nhật ký tuần " + logbook.getWeekNumber()
                    + (mentorFeedback != null && !mentorFeedback.isBlank() ? ": " + mentorFeedback.trim() : ""),
                "/student/weekly-logs"
            );
        } else if (status == LogbookStatus.APPROVED_BY_MENTOR) {
            notificationService.sendNotification(
                studentId,
                "LOGBOOK_APPROVED",
                "Nhật ký tuần " + logbook.getWeekNumber() + " đã được duyệt",
                "Mentor đã phê duyệt nhật ký thực tập tuần " + logbook.getWeekNumber() + " của bạn.",
                "/student/weekly-logs"
            );
        }

        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public WeeklyLogbookResponse commentByLecturer(UUID id, UUID lecturerUserId, String lecturerComment) {
        WeeklyLogbook logbook = logbookRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("WeeklyLogbook", "id", id));

        User lecturer = userRepository.findById(lecturerUserId)
            .orElseThrow(() -> new ResourceNotFoundException("User", "id", lecturerUserId));

        if (lecturer.getRole() != UserRole.ADMIN
            && !logbook.getPlacement().getLecturer().getId().equals(lecturerUserId)) {
            throw new BadRequestException("Người dùng không phải Giảng viên phụ trách lần thực tập này");
        }

        logbook.setLecturerComment(lecturerComment != null ? lecturerComment.trim() : null);
        logbook.setLecturerCommentedBy(lecturer);
        logbook.setLecturerCommentedAt(OffsetDateTime.now());

        WeeklyLogbook saved = logbookRepository.save(logbook);

        // Thông báo cho sinh viên khi giảng viên nhận xét
        notificationService.sendNotification(
            logbook.getPlacement().getStudent().getId(),
            "LOGBOOK_COMMENTED",
            "Nhận xét mới cho nhật ký tuần " + logbook.getWeekNumber(),
            "Giảng viên hướng dẫn đã thêm nhận xét cho nhật ký tuần " + logbook.getWeekNumber()
                + (lecturerComment != null && !lecturerComment.isBlank() ? ": " + lecturerComment.trim() : ""),
            "/student/weekly-logs"
        );

        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public WeeklyLogbookResponse reviewByLecturer(UUID id, UUID lecturerUserId, LogbookStatus status, String feedback) {
        WeeklyLogbook logbook = logbookRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("WeeklyLogbook", "id", id));
        var lecturer = userRepository.findById(lecturerUserId)
            .orElseThrow(() -> new ResourceNotFoundException("User", "id", lecturerUserId));
        ResourceAuthorization.require(lecturer.getRole() == UserRole.LECTURER
            && lecturer.getId().equals(logbook.getPlacement().getLecturer().getId())
            && "STUDENT_FOUND".equals(logbook.getPlacement().getSource()));
        if (logbook.getStatus() != LogbookStatus.SUBMITTED
            || (status != LogbookStatus.APPROVED_BY_LECTURER && status != LogbookStatus.REVISION_REQUESTED))
            throw new BadRequestException("Trạng thái xét nhật ký không hợp lệ");
        if (status == LogbookStatus.REVISION_REQUESTED && (feedback == null || feedback.isBlank()))
            throw new BadRequestException("Cần nêu nội dung cần sửa");
        logbook.setStatus(status);
        logbook.setLecturerComment(feedback != null ? feedback.trim() : null);
        logbook.setLecturerCommentedBy(lecturer);
        logbook.setLecturerCommentedAt(OffsetDateTime.now());

        WeeklyLogbook saved = logbookRepository.save(logbook);

        UUID studentId = logbook.getPlacement().getStudent().getId();
        if (status == LogbookStatus.REVISION_REQUESTED) {
            notificationService.sendNotification(
                studentId,
                "LOGBOOK_REVISION_REQUESTED",
                "Yêu cầu chỉnh sửa nhật ký tuần " + logbook.getWeekNumber(),
                "Giảng viên yêu cầu bạn chỉnh sửa lại nhật ký tuần " + logbook.getWeekNumber()
                    + (feedback != null && !feedback.isBlank() ? ": " + feedback.trim() : ""),
                "/student/weekly-logs"
            );
        } else if (status == LogbookStatus.APPROVED_BY_LECTURER) {
            notificationService.sendNotification(
                studentId,
                "LOGBOOK_APPROVED",
                "Nhật ký tuần " + logbook.getWeekNumber() + " đã được duyệt",
                "Giảng viên hướng dẫn đã duyệt nhật ký thực tập tuần " + logbook.getWeekNumber() + " của bạn.",
                "/student/weekly-logs"
            );
        }

        return mapToResponse(saved);
    }

    private User currentActor() {
        UUID id = securityGuard.currentUser().getId();
        return userRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
    }

    private WeeklyLogbookResponse mapToResponse(WeeklyLogbook entity) {
        return WeeklyLogbookResponse.builder()
            .id(entity.getId())
            .placementId(entity.getPlacement().getId())
            .weekNumber(entity.getWeekNumber())
            .periodStart(entity.getPeriodStart())
            .periodEnd(entity.getPeriodEnd())
            .tasksCompleted(entity.getTasksCompleted())
            .learningReflection(entity.getLearningReflection())
            .totalHours(entity.getTotalHours())
            .wasLate(entity.getWasLate())
            .status(entity.getStatus())
            .mentorFeedback(entity.getMentorFeedback())
            .mentorReviewedBy(entity.getMentorReviewedBy() != null ? entity.getMentorReviewedBy().getId() : null)
            .mentorReviewedAt(entity.getMentorReviewedAt())
            .lecturerComment(entity.getLecturerComment())
            .lecturerCommentedBy(entity.getLecturerCommentedBy() != null ? entity.getLecturerCommentedBy().getId() : null)
            .lecturerCommentedAt(entity.getLecturerCommentedAt())
            .submittedAt(entity.getSubmittedAt())
            .createdAt(entity.getCreatedAt())
            .build();
    }
}
