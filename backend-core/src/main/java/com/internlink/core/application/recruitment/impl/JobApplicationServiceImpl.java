package com.internlink.core.application.recruitment.impl;

import com.internlink.core.application.recruitment.JobApplicationService;
import com.internlink.core.domain.auth.User;
import com.internlink.core.domain.organization.StudentRoster;
import com.internlink.core.domain.recruitment.JobApplication;
import com.internlink.core.domain.recruitment.JobPosition;
import com.internlink.core.domain.student.StudentProfile;
import com.internlink.core.domain.system.Document;
import com.internlink.core.infrastructure.persistence.jpa.JpaDocumentRepository;
import com.internlink.core.infrastructure.persistence.jpa.JpaJobApplicationRepository;
import com.internlink.core.infrastructure.persistence.jpa.JpaJobPositionRepository;
import com.internlink.core.infrastructure.persistence.jpa.JpaPlacementOfferRepository;
import com.internlink.core.infrastructure.persistence.jpa.JpaStudentProfileRepository;
import com.internlink.core.infrastructure.persistence.jpa.JpaStudentRosterRepository;
import com.internlink.core.infrastructure.persistence.jpa.JpaUserRepository;
import com.internlink.core.presentation.recruitment.dto.request.JobApplicationRequest;
import com.internlink.core.presentation.recruitment.dto.response.JobApplicationResponse;
import com.internlink.core.shared.enums.ApplicationStatus;
import com.internlink.core.shared.enums.DocumentType;
import com.internlink.core.shared.enums.EligibilityStatus;
import com.internlink.core.shared.enums.JobStatus;
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
public class JobApplicationServiceImpl implements JobApplicationService {

    private final JpaJobApplicationRepository applicationRepository;
    private final JpaJobPositionRepository jobPositionRepository;
    private final JpaUserRepository userRepository;
    private final JpaDocumentRepository documentRepository;
    private final JpaStudentProfileRepository studentProfileRepository;
    private final JpaStudentRosterRepository studentRosterRepository;
    private final JpaPlacementOfferRepository offerRepository;
    private final SecurityGuard securityGuard;

    /** Giới hạn số đơn ứng tuyển đang hoạt động trong một kỳ. */
    private static final int MAX_ACTIVE_APPLICATIONS_PER_TERM = 5;

    @Override
    @Transactional(readOnly = true)
    public List<JobApplicationResponse> getApplicationsByStudent(UUID studentId) {
        User actor = currentActor();
        ResourceAuthorization.require(ResourceAuthorization.isAdmin(actor) || actor.getId().equals(studentId));
        return applicationRepository.findByStudentId(studentId).stream()
            .map(this::mapToResponse)
            .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<JobApplicationResponse> getApplicationsByJob(UUID jobId) {
        JobPosition job = jobPositionRepository.findById(jobId)
            .orElseThrow(() -> new ResourceNotFoundException("JobPosition", "id", jobId));
        User actor = currentActor();
        ResourceAuthorization.require(ResourceAuthorization.representsCompany(actor, job.getCompany().getId())
            || ResourceAuthorization.managesDepartment(actor, job.getDepartment().getId()));
        return applicationRepository.findByJobId(jobId).stream()
            .map(this::mapToResponse)
            .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public JobApplicationResponse getApplicationById(UUID id) {
        JobApplication app = applicationRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("JobApplication", "id", id));
        ResourceAuthorization.require(ResourceAuthorization.canReadApplication(currentActor(), app));
        return mapToResponse(app);
    }

    /**
     * Nộp hồ sơ ứng tuyển vị trí thực tập với đầy đủ kiểm tra điều kiện.
     *
     * <p>Các guard theo thứ tự kiểm tra:
     * <ol>
     *   <li>Người dùng phải là STUDENT</li>
     *   <li>Vị trí phải ở trạng thái APPROVED</li>
     *   <li>Kỳ thực tập phải đang ở trạng thái APPLICATION_OPEN</li>
     *   <li>Thời điểm hiện tại phải trong hạn nộp hồ sơ (applicationDeadline)</li>
     *   <li>Sinh viên phải có trong danh sách Roster với trạng thái ELIGIBLE</li>
     *   <li>Ngành đào tạo sinh viên phải khớp với targetProgramCodes của vị trí</li>
     *   <li>Chỉ tiêu tuyển dụng còn chỗ (vacancies chưa đầy)</li>
     *   <li>Sinh viên chưa nộp đơn vào vị trí này</li>
     *   <li>Sinh viên chưa vượt quá giới hạn đơn đồng thời trong kỳ</li>
     *   <li>CV phải thuộc sở hữu của sinh viên</li>
     * </ol>
     * </p>
     */
    @Override
    @Transactional
    public JobApplicationResponse applyJob(UUID studentId, JobApplicationRequest request) {
        // ── Guard 1: Xác minh người dùng là STUDENT ─────────────────────────
        User student = userRepository.findById(studentId)
            .orElseThrow(() -> new ResourceNotFoundException("User", "id", studentId));
        ResourceAuthorization.require(studentId.equals(securityGuard.currentUser().getId()));

        if (student.getRole() != UserRole.STUDENT) {
            throw new BadRequestException("Chỉ sinh viên mới có thể nộp hồ sơ ứng tuyển");
        }

        // ── Guard 2: Vị trí phải đã được phê duyệt ──────────────────────────
        JobPosition job = jobPositionRepository.findById(request.getJobId())
            .orElseThrow(() -> new ResourceNotFoundException("JobPosition", "id", request.getJobId()));

        if (job.getStatus() != JobStatus.APPROVED) {
            throw new BadRequestException("Vị trí thực tập chưa được phê duyệt hoặc đã đóng");
        }

        // ── Guard 3: Kỳ thực tập phải đang APPLICATION_OPEN ─────────────────
        var term = job.getTerm();
        if (term.getStatus() != TermStatus.APPLICATION_OPEN) {
            throw new BadRequestException(String.format(
                "Kỳ thực tập '%s' hiện ở trạng thái %s, không nhận hồ sơ ứng tuyển",
                term.getCode(), term.getStatus()
            ));
        }

        // ── Guard 4: Hạn nộp hồ sơ chưa qua ────────────────────────────────
        OffsetDateTime now = OffsetDateTime.now();
        if (now.isAfter(term.getApplicationDeadline())) {
            throw new BadRequestException(String.format(
                "Đã qua hạn nộp hồ sơ kỳ '%s' (%s)",
                term.getCode(), term.getApplicationDeadline()
            ));
        }

        // ── Guard 5: Sinh viên phải có trong Roster với trạng thái ELIGIBLE ─
        StudentProfile studentProfile = studentProfileRepository.findByUserId(studentId)
            .orElseThrow(() -> new BadRequestException("Chưa có hồ sơ sinh viên. Vui lòng hoàn thiện hồ sơ trước khi ứng tuyển"));

        StudentRoster roster = studentRosterRepository
            .findByTermIdAndClaimedUserId(term.getId(), studentId)
            .orElseThrow(() -> new BadRequestException(String.format(
                "Sinh viên chưa được thêm vào danh sách kỳ thực tập '%s'. Liên hệ Khoa để cập nhật.",
                term.getCode()
            )));

        if (roster.getEligibilityStatus() != EligibilityStatus.ELIGIBLE) {
            throw new BadRequestException(String.format(
                "Sinh viên chưa đủ điều kiện tham gia kỳ thực tập '%s' (trạng thái: %s). %s",
                term.getCode(),
                roster.getEligibilityStatus(),
                roster.getEligibilityNote() != null ? roster.getEligibilityNote() : ""
            ));
        }

        // ── Guard 6: Ngành đào tạo phải khớp với vị trí ────────────────────
        List<String> targetProgramCodes = job.getTargetProgramCodes();
        if (targetProgramCodes != null && !targetProgramCodes.isEmpty()) {
            String studentProgramCode = studentProfile.getProgram().getCode();
            if (!targetProgramCodes.contains(studentProgramCode)) {
                throw new BadRequestException(String.format(
                    "Vị trí '%s' yêu cầu ngành %s, sinh viên thuộc ngành %s",
                    job.getTitle(), targetProgramCodes, studentProgramCode
                ));
            }
        }

        // ── Guard 7: Chỉ tiêu còn chỗ ────────────────────────────────────────
        long activeCount = offerRepository.countReservedPlaces(job.getId(), now);
        if (activeCount >= job.getVacancies()) {
            throw new BadRequestException(String.format(
                "Vị trí '%s' đã đủ chỉ tiêu tuyển dụng (%d/%d)",
                job.getTitle(), activeCount, job.getVacancies()
            ));
        }

        // ── Guard 8: Chưa nộp đơn vào vị trí này ────────────────────────────
        if (applicationRepository.existsByJobIdAndStudentId(request.getJobId(), studentId)) {
            throw new BadRequestException("Bạn đã nộp hồ sơ ứng tuyển vào vị trí này rồi");
        }

        // ── Guard 9: Chưa vượt quá giới hạn đơn đồng thời trong kỳ ──────────
        long activeAppsInTerm = applicationRepository
            .countActiveApplicationsByStudentInTerm(studentId, term.getId());
        if (activeAppsInTerm >= MAX_ACTIVE_APPLICATIONS_PER_TERM) {
            throw new BadRequestException(String.format(
                "Bạn đang có %d hồ sơ đang xử lý trong kỳ '%s' (tối đa %d). Rút bớt hồ sơ trước khi nộp thêm.",
                activeAppsInTerm, term.getCode(), MAX_ACTIVE_APPLICATIONS_PER_TERM
            ));
        }

        // ── Guard 10: CV phải là của sinh viên ───────────────────────────────
        Document cvDoc = documentRepository.findById(request.getSubmittedCvDocumentId())
            .orElseThrow(() -> new ResourceNotFoundException("Document", "id", request.getSubmittedCvDocumentId()));

        if (!cvDoc.getOwner().getId().equals(studentId) || cvDoc.getDocumentType() != DocumentType.CV) {
            throw new BadRequestException("Tài liệu nộp kèm phải là CV thuộc sở hữu của sinh viên");
        }

        JobApplication application = JobApplication.builder()
            .job(job)
            .student(student)
            .submittedCvDocument(cvDoc)
            .coverLetter(request.getCoverLetter())
            .status(ApplicationStatus.SUBMITTED)
            .interviewRounds(List.of())
            .build();

        return mapToResponse(applicationRepository.save(application));
    }

    @Override
    @Transactional
    public JobApplicationResponse updateApplicationStatus(UUID id, ApplicationStatus status) {
        JobApplication app = applicationRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("JobApplication", "id", id));
        User actor = currentActor();
        ResourceAuthorization.require(ResourceAuthorization.isAdmin(actor)
            || ResourceAuthorization.representsCompany(actor, app.getJob().getCompany().getId()));

        if (!isValidTransition(app.getStatus(), status)) {
            throw new BadRequestException("Chuyển trạng thái hồ sơ không hợp lệ: " + app.getStatus() + " -> " + status);
        }

        app.setStatus(status);
        return mapToResponse(applicationRepository.save(app));
    }

    @Override
    @Transactional
    public JobApplicationResponse withdrawApplication(UUID id) {
        JobApplication app = applicationRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("JobApplication", "id", id));
        User actor = currentActor();
        ResourceAuthorization.require(actor.getRole() == UserRole.STUDENT
            && actor.getId().equals(app.getStudent().getId()));
        if (app.getStatus() != ApplicationStatus.SUBMITTED
            && app.getStatus() != ApplicationStatus.REVIEWING
            && app.getStatus() != ApplicationStatus.INTERVIEWING) {
            throw new BadRequestException("Chỉ có thể rút hồ sơ trước khi nhận offer");
        }
        app.setStatus(ApplicationStatus.WITHDRAWN);
        return mapToResponse(applicationRepository.save(app));
    }

    private User currentActor() {
        UUID actorId = securityGuard.currentUser().getId();
        return userRepository.findById(actorId)
            .orElseThrow(() -> new ResourceNotFoundException("User", "id", actorId));
    }

    private boolean isValidTransition(ApplicationStatus current, ApplicationStatus next) {
        return switch (current) {
            case SUBMITTED -> next == ApplicationStatus.REVIEWING || next == ApplicationStatus.REJECTED;
            case REVIEWING -> next == ApplicationStatus.INTERVIEWING || next == ApplicationStatus.REJECTED;
            case INTERVIEWING -> next == ApplicationStatus.REJECTED;
            case OFFERED -> false;
            case REJECTED, WITHDRAWN -> false;
        };
    }

    private JobApplicationResponse mapToResponse(JobApplication entity) {
        return JobApplicationResponse.builder()
            .id(entity.getId())
            .jobId(entity.getJob().getId())
            .jobTitle(entity.getJob().getTitle())
            .companyName(entity.getJob().getCompany().getCompanyName())
            .studentId(entity.getStudent().getId())
            .studentName(entity.getStudent().getFullName())
            .studentEmail(entity.getStudent().getEmail())
            .submittedCvDocumentId(entity.getSubmittedCvDocument().getId())
            .coverLetter(entity.getCoverLetter())
            .aiMatchDetail(entity.getAiMatchDetail())
            .status(entity.getStatus())
            .submittedAt(entity.getSubmittedAt())
            .updatedAt(entity.getUpdatedAt())
            .build();
    }
}
