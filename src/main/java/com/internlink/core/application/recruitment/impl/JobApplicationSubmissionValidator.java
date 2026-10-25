package com.internlink.core.application.recruitment.impl;

import com.internlink.core.domain.recruitment.JobPosition;
import com.internlink.core.domain.system.Document;
import com.internlink.core.infrastructure.persistence.jpa.*;
import com.internlink.core.presentation.recruitment.dto.request.JobApplicationRequest;
import com.internlink.core.shared.enums.*;
import com.internlink.core.shared.exception.*;
import com.internlink.core.shared.security.TermGuard;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import java.time.OffsetDateTime;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class JobApplicationSubmissionValidator {
    private static final int MAX_ACTIVE_APPLICATIONS_PER_TERM = 5;
    private final JpaJobApplicationRepository applications;
    private final JpaDocumentRepository documents;
    private final JpaStudentProfileRepository profiles;
    private final JpaStudentRosterRepository rosters;
    private final JpaPlacementOfferRepository offers;
    private final JpaInternshipPlacementRepository placements;

    public Document validate(UUID studentId, JobApplicationRequest request, JobPosition job) {
        if (job.getStatus() != JobStatus.APPROVED || job.getClosedEarlyAt() != null)
            throw new BadRequestException("Vị trí tuyển dụng chưa được Khoa phê duyệt hoặc đã đóng nhận hồ sơ");
        OffsetDateTime now = OffsetDateTime.now();
        if (job.getApplicationDeadline() != null && now.isAfter(job.getApplicationDeadline()))
            throw new BadRequestException("Vị trí tuyển dụng đã hết hạn nộp hồ sơ");

        var profile = profiles.findByUserId(studentId)
                .orElseThrow(() -> new BadRequestException("Chưa có hồ sơ sinh viên. Vui lòng hoàn thiện hồ sơ trước khi ứng tuyển"));

        boolean isFresherOrAlumni = isFresherOrAlumniApplication(studentId, job);

        var term = job.getTerm();
        if (term != null && !isFresherOrAlumni) {
            TermGuard.requireNotClosed(term);
            if (term.getStatus() != TermStatus.REGISTRATION_OPEN
                    && term.getStatus() != TermStatus.APPLICATION_OPEN
                    && term.getStatus() != TermStatus.ACTIVE)
                throw new BadRequestException("Kỳ thực tập hiện không tiếp nhận hồ sơ ứng tuyển");

            var roster = rosters.findByTermIdAndClaimedUserId(term.getId(), studentId)
                    .orElseThrow(() -> new BadRequestException("Sinh viên chưa có trong danh sách kỳ thực tập này"));
            if (roster.getEligibilityStatus() != EligibilityStatus.ELIGIBLE)
                throw new BadRequestException("Sinh viên chưa đủ điều kiện tham gia kỳ thực tập");

            if (applications.countActiveApplicationsByStudentInTerm(studentId, term.getId())
                    >= MAX_ACTIVE_APPLICATIONS_PER_TERM)
                throw new BadRequestException("Bạn đã đạt giới hạn hồ sơ đang xử lý trong kỳ thực tập");
        }

        // Soft preference: targetProgramCodes is advisory; applicants from other majors can still apply.
        if (offers.countReservedPlaces(job.getId(), now) >= job.getVacancies())
            throw new BadRequestException("Vị trí tuyển dụng đã đủ chỉ tiêu");
        if (applications.existsByJobIdAndStudentId(request.getJobId(), studentId))
            throw new BadRequestException("Bạn đã nộp hồ sơ ứng tuyển vào vị trí này rồi");

        Document cv = documents.findById(request.getSubmittedCvDocumentId())
                .orElseThrow(() -> new ResourceNotFoundException("Document", "id", request.getSubmittedCvDocumentId()));
        if (!cv.getOwner().getId().equals(studentId) || cv.getDocumentType() != DocumentType.CV)
            throw new BadRequestException("Tài liệu nộp kèm phải là CV thuộc sở hữu của sinh viên");
        return cv;
    }

    private boolean isFresherOrAlumniApplication(UUID studentId, JobPosition job) {
        if (job.getTerm() == null) return true;
        String titleLower = job.getTitle() != null ? job.getTitle().toLowerCase() : "";
        String descLower = job.getDescription() != null ? job.getDescription().toLowerCase() : "";
        boolean isFresherJob = titleLower.contains("fresher")
                || titleLower.contains("full-time")
                || titleLower.contains("fulltime")
                || titleLower.contains("chính thức")
                || descLower.contains("tốt nghiệp")
                || descLower.contains("ra trường");
        if (isFresherJob) return true;

        return placements.findByStudentId(studentId).stream()
                .anyMatch(p -> p.getStatus() == PlacementStatus.COMPLETED);
    }
}
