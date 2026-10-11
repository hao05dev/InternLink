package com.internlink.core.application.placement;

import com.internlink.core.application.system.NotificationService;
import com.internlink.core.domain.auth.User;
import com.internlink.core.domain.placement.IntroductionLetterRequest;
import com.internlink.core.infrastructure.persistence.jpa.JpaIntroductionLetterRequestRepository;
import com.internlink.core.infrastructure.persistence.jpa.JpaInternshipTermRepository;
import com.internlink.core.infrastructure.persistence.jpa.JpaStudentRosterRepository;
import com.internlink.core.infrastructure.persistence.jpa.JpaUserRepository;
import com.internlink.core.presentation.placement.dto.request.CreateIntroductionLetterRequest;
import com.internlink.core.presentation.placement.dto.request.ReviewIntroductionLetterRequest;
import com.internlink.core.presentation.placement.dto.response.IntroductionLetterResponse;
import com.internlink.core.shared.enums.EligibilityStatus;
import com.internlink.core.shared.enums.IntroductionLetterStatus;
import com.internlink.core.shared.enums.TermStatus;
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
public class IntroductionLetterService {

    private final JpaIntroductionLetterRequestRepository letterRequests;
    private final JpaInternshipTermRepository terms;
    private final JpaStudentRosterRepository rosters;
    private final JpaUserRepository users;
    private final SecurityGuard security;
    private final NotificationService notifications;

    @Transactional
    public IntroductionLetterResponse create(CreateIntroductionLetterRequest request) {
        User student = actor();
        ResourceAuthorization.require(student.getRole() == UserRole.STUDENT);

        var term = terms.findById(request.termId())
                .orElseThrow(() -> new ResourceNotFoundException("InternshipTerm", "id", request.termId()));

        if (term.getStatus() != TermStatus.REGISTRATION_OPEN && term.getStatus() != TermStatus.APPLICATION_OPEN) {
            throw new BadRequestException("Kỳ thực tập chưa mở hoặc đã đóng đăng ký tiếp nhận");
        }

        var roster = rosters.findByTermIdAndClaimedUserId(term.getId(), student.getId())
                .orElseThrow(() -> new BadRequestException("Sinh viên chưa được xác nhận trong danh sách kỳ thực tập"));

        if (roster.getEligibilityStatus() != EligibilityStatus.ELIGIBLE) {
            throw new BadRequestException("Sinh viên chưa đủ điều kiện thực tập");
        }

        List<IntroductionLetterStatus> activeStatuses = List.of(
                IntroductionLetterStatus.PENDING,
                IntroductionLetterStatus.APPROVED,
                IntroductionLetterStatus.ISSUED
        );
        var existingActive = letterRequests.findActiveRequestsByStudentAndTerm(student.getId(), term.getId(), activeStatuses);
        if (!existingActive.isEmpty()) {
            throw new BadRequestException("Mỗi sinh viên chỉ được cấp 1 giấy giới thiệu trong kỳ thực tập. Bạn đã có yêu cầu đang xử lý hoặc đã được cấp.");
        }

        IntroductionLetterRequest entity = IntroductionLetterRequest.builder()
                .student(student)
                .term(term)
                .targetCompanyName(request.targetCompanyName().trim())
                .targetPosition(request.targetPosition() != null ? request.targetPosition().trim() : null)
                .reason(request.reason() != null ? request.reason().trim() : null)
                .status(IntroductionLetterStatus.PENDING)
                .build();

        IntroductionLetterRequest saved = letterRequests.save(entity);
        return toResponse(saved, roster.getStudentCode());
    }

    @Transactional
    public IntroductionLetterResponse review(UUID id, ReviewIntroductionLetterRequest request) {
        User faculty = actor();
        ResourceAuthorization.require(faculty.getRole() == UserRole.FACULTY_ADMIN || faculty.getRole() == UserRole.ADMIN);

        IntroductionLetterRequest entity = letterRequests.findByIdForUpdate(id)
                .orElseThrow(() -> new ResourceNotFoundException("IntroductionLetterRequest", "id", id));
        requireManagesDepartmentOf(faculty, entity);
        requireTransition(entity.getStatus(), request.status());

        entity.setStatus(request.status());
        entity.setIssueNote(request.issueNote());
        entity.setProcessedBy(faculty);
        entity.setProcessedAt(OffsetDateTime.now());

        if (request.status() == IntroductionLetterStatus.ISSUED) {
            entity.setIssuedCode(resolveIssuedCode(entity, request.issuedCode()));
            entity.setReceivedAt(OffsetDateTime.now());
        } else if (request.status() == IntroductionLetterStatus.APPROVED) {
            entity.setIssuedCode(resolveIssuedCode(entity, request.issuedCode()));
        }

        IntroductionLetterRequest saved = letterRequests.save(entity);

        String message = switch (request.status()) {
            case APPROVED -> "Yêu cầu Giấy giới thiệu thực tập tại " + entity.getTargetCompanyName() + " đã được phê duyệt. Vui lòng đến sảnh VP Khoa để nhận giấy.";
            case ISSUED -> "Giấy giới thiệu thực tập của bạn đã được phát hành (" + entity.getIssuedCode() + ").";
            case REJECTED -> "Yêu cầu Giấy giới thiệu thực tập bị từ chối: " + (request.issueNote() != null ? request.issueNote() : "Không có lý do");
            default -> "Trạng thái yêu cầu Giấy giới thiệu của bạn đã được cập nhật.";
        };
        notifications.sendNotification(
                entity.getStudent().getId(),
                "INTRODUCTION_LETTER_" + request.status().name(),
                "Cập nhật Giấy giới thiệu thực tập",
                message,
                "/student/internship-record"
        );

        var roster = rosters.findByTermIdAndClaimedUserId(entity.getTerm().getId(), entity.getStudent().getId());
        String studentCode = roster.map(r -> r.getStudentCode()).orElse(null);

        return toResponse(saved, studentCode);
    }

    @Transactional
    public IntroductionLetterResponse confirmReceived(UUID id) {
        User faculty = actor();
        ResourceAuthorization.require(faculty.getRole() == UserRole.FACULTY_ADMIN || faculty.getRole() == UserRole.ADMIN);

        IntroductionLetterRequest entity = letterRequests.findByIdForUpdate(id)
                .orElseThrow(() -> new ResourceNotFoundException("IntroductionLetterRequest", "id", id));
        requireManagesDepartmentOf(faculty, entity);

        if (entity.getStatus() != IntroductionLetterStatus.APPROVED) {
            throw new BadRequestException("Chỉ giấy giới thiệu đã được duyệt và chưa phát hành mới có thể xác nhận đã nhận");
        }

        entity.setStatus(IntroductionLetterStatus.ISSUED);
        entity.setReceivedAt(OffsetDateTime.now());
        IntroductionLetterRequest saved = letterRequests.save(entity);

        var roster = rosters.findByTermIdAndClaimedUserId(entity.getTerm().getId(), entity.getStudent().getId());
        String studentCode = roster.map(r -> r.getStudentCode()).orElse(null);

        return toResponse(saved, studentCode);
    }

    @Transactional
    public IntroductionLetterResponse cancel(UUID id) {
        User student = actor();
        IntroductionLetterRequest entity = letterRequests.findByIdForUpdate(id)
                .orElseThrow(() -> new ResourceNotFoundException("IntroductionLetterRequest", "id", id));

        ResourceAuthorization.require(student.getId().equals(entity.getStudent().getId()));

        if (entity.getStatus() != IntroductionLetterStatus.PENDING) {
            throw new BadRequestException("Chỉ có thể hủy yêu cầu khi đang ở trạng thái chờ duyệt (PENDING)");
        }

        entity.setStatus(IntroductionLetterStatus.CANCELLED);
        IntroductionLetterRequest saved = letterRequests.save(entity);

        var roster = rosters.findByTermIdAndClaimedUserId(entity.getTerm().getId(), entity.getStudent().getId());
        String studentCode = roster.map(r -> r.getStudentCode()).orElse(null);

        return toResponse(saved, studentCode);
    }

    @Transactional(readOnly = true)
    public List<IntroductionLetterResponse> mine() {
        User student = actor();
        return letterRequests.findByStudentIdOrderByCreatedAtDesc(student.getId())
                .stream()
                .map(item -> {
                    var roster = rosters.findByTermIdAndClaimedUserId(item.getTerm().getId(), student.getId());
                    return toResponse(item, roster.map(r -> r.getStudentCode()).orElse(null));
                })
                .toList();
    }

    @Transactional(readOnly = true)
    public List<IntroductionLetterResponse> byTerm(UUID termId) {
        User user = actor();
        ResourceAuthorization.require(user.getRole() == UserRole.FACULTY_ADMIN || user.getRole() == UserRole.ADMIN || user.getRole() == UserRole.LECTURER);

        var term = terms.findById(termId)
                .orElseThrow(() -> new ResourceNotFoundException("InternshipTerm", "id", termId));
        UUID departmentId = term.getDepartment().getId();
        ResourceAuthorization.require(
                ResourceAuthorization.managesDepartment(user, departmentId)
                        || user.getRole() == UserRole.LECTURER
                                && user.getDepartment() != null
                                && user.getDepartment().getId().equals(departmentId));

        return letterRequests.findByTermIdOrderByCreatedAtDesc(termId)
                .stream()
                .map(item -> {
                    var roster = rosters.findByTermIdAndClaimedUserId(item.getTerm().getId(), item.getStudent().getId());
                    return toResponse(item, roster.map(r -> r.getStudentCode()).orElse(null));
                })
                .toList();
    }

    private void requireManagesDepartmentOf(User faculty, IntroductionLetterRequest entity) {
        ResourceAuthorization.require(
                ResourceAuthorization.managesDepartment(faculty, entity.getTerm().getDepartment().getId()));
    }

    /** Bảng chuyển trạng thái duy nhất: PENDING→APPROVED|REJECTED, APPROVED→ISSUED|REJECTED; còn lại là trạng thái cuối. */
    private void requireTransition(IntroductionLetterStatus from, IntroductionLetterStatus to) {
        boolean allowed = switch (from) {
            case PENDING -> to == IntroductionLetterStatus.APPROVED || to == IntroductionLetterStatus.REJECTED;
            case APPROVED -> to == IntroductionLetterStatus.ISSUED || to == IntroductionLetterStatus.REJECTED;
            case ISSUED, REJECTED, CANCELLED -> false;
        };
        if (!allowed) {
            throw new BadRequestException("Không thể chuyển yêu cầu từ trạng thái " + from + " sang " + to);
        }
    }

    private String resolveIssuedCode(IntroductionLetterRequest entity, String requested) {
        if (requested != null && !requested.isBlank()) {
            return requested.trim();
        }
        if (entity.getIssuedCode() != null) {
            return entity.getIssuedCode();
        }
        return "GGT-" + entity.getTerm().getCode() + "-" + entity.getId().toString().substring(0, 8).toUpperCase();
    }

    private User actor() {
        UUID id = security.currentUser().getId();
        return users.findById(id).orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
    }

    private IntroductionLetterResponse toResponse(IntroductionLetterRequest entity, String studentCode) {
        return new IntroductionLetterResponse(
                entity.getId(),
                entity.getStudent().getId(),
                entity.getStudent().getFullName(),
                studentCode,
                entity.getTerm().getId(),
                entity.getTerm().getTermName(),
                entity.getTargetCompanyName(),
                entity.getTargetPosition(),
                entity.getReason(),
                entity.getStatus(),
                entity.getIssuedCode(),
                entity.getIssueNote(),
                entity.getProcessedBy() != null ? entity.getProcessedBy().getFullName() : null,
                entity.getProcessedAt(),
                entity.getReceivedAt(),
                entity.getCreatedAt()
        );
    }
}
