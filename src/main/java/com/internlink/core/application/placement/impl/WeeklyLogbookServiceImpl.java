package com.internlink.core.application.placement.impl;

import com.internlink.core.application.placement.WeeklyLogbookService;
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

    @Override
    @Transactional(readOnly = true)
    public List<WeeklyLogbookResponse> getLogbooksByPlacement(UUID placementId) {
        return logbookRepository.findByPlacementIdOrderByWeekNumberAsc(placementId).stream()
            .map(this::mapToResponse)
            .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public WeeklyLogbookResponse getLogbookById(UUID id) {
        WeeklyLogbook logbook = logbookRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("WeeklyLogbook", "id", id));
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

        if (logbookRepository.existsByPlacementIdAndWeekNumber(request.getPlacementId(), request.getWeekNumber())) {
            throw new BadRequestException("Nhật ký cho tuần " + request.getWeekNumber() + " đã tồn tại trong đợt thực tập này");
        }

        WeeklyLogbook logbook = WeeklyLogbook.builder()
            .placement(placement)
            .weekNumber(request.getWeekNumber())
            .periodStart(request.getPeriodStart())
            .periodEnd(request.getPeriodEnd())
            .tasksCompleted(request.getTasksCompleted().trim())
            .learningReflection(request.getLearningReflection().trim())
            .totalHours(request.getTotalHours())
            .status(LogbookStatus.SUBMITTED)
            .submittedAt(OffsetDateTime.now())
            .build();

        return mapToResponse(logbookRepository.save(logbook));
    }

    @Override
    @Transactional
    public WeeklyLogbookResponse reviewByMentor(UUID id, UUID mentorUserId, LogbookStatus status, String mentorFeedback) {
        WeeklyLogbook logbook = logbookRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("WeeklyLogbook", "id", id));

        User mentor = userRepository.findById(mentorUserId)
            .orElseThrow(() -> new ResourceNotFoundException("User", "id", mentorUserId));

        if (mentor.getRole() != UserRole.ADMIN && !logbook.getPlacement().getMentor().getId().equals(mentorUserId)) {
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

        return mapToResponse(logbookRepository.save(logbook));
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

        return mapToResponse(logbookRepository.save(logbook));
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
