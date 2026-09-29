package com.internlink.core.application.placement;

import com.internlink.core.application.system.NotificationService;
import com.internlink.core.domain.organization.StudentRoster;
import com.internlink.core.domain.placement.*;
import com.internlink.core.domain.system.Document;
import com.internlink.core.infrastructure.persistence.jpa.*;
import com.internlink.core.presentation.placement.dto.request.StudentFoundRequest;
import com.internlink.core.presentation.placement.dto.response.StudentFoundResponse;
import com.internlink.core.shared.enums.*;
import com.internlink.core.shared.exception.*;
import com.internlink.core.shared.security.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service @RequiredArgsConstructor
public class StudentFoundApplicationService {
    private final JpaStudentFoundApplicationRepository applications;
    private final JpaInternshipPlacementRepository placements;
    private final JpaStudentRosterRepository rosters;
    private final JpaInternshipTermRepository terms;
    private final JpaDocumentRepository documents;
    private final JpaUserRepository users;
    private final SecurityGuard security;
    private final NotificationService notifications;

    @Transactional
    public StudentFoundResponse create(StudentFoundRequest request) {
        var student = actor();
        ResourceAuthorization.require(student.getRole() == UserRole.STUDENT);
        var term = terms.findById(request.termId()).orElseThrow(() -> new ResourceNotFoundException("InternshipTerm", "id", request.termId()));
        if (term.getStatus() != TermStatus.REGISTRATION_OPEN && term.getStatus() != TermStatus.APPLICATION_OPEN)
            throw new BadRequestException("Kỳ thực tập chưa mở hoặc đã đóng đăng ký nơi tự tìm");
        var roster = rosters.findByTermIdAndClaimedUserId(term.getId(), student.getId())
            .orElseThrow(() -> new BadRequestException("Sinh viên chưa được xác nhận trong danh sách kỳ thực tập"));
        if (roster.getEligibilityStatus() != EligibilityStatus.ELIGIBLE)
            throw new BadRequestException("Sinh viên chưa đủ điều kiện thực tập");
        if (roster.getInternshipCourseCode() == null || roster.getInternshipCourseCode().isBlank())
            throw new BadRequestException("Danh sách sinh viên chưa có mã học phần thực tập");
        if (applications.findByTermIdAndStudentId(term.getId(), student.getId()).isPresent()
            || !placements.findByTermIdAndStudentId(term.getId(), student.getId()).isEmpty())
            throw new BadRequestException("Sinh viên đã có hồ sơ hoặc lần thực tập trong kỳ");
        if (request.startDate().isAfter(request.endDate()) || request.startDate().isBefore(term.getStartDate())
            || request.endDate().isAfter(term.getEndDate()))
            throw new BadRequestException("Thời gian thực tập không nằm trong kỳ");
        var app = StudentFoundApplication.builder().term(term).student(student)
            .hostName(request.hostName().trim()).hostAddress(request.hostAddress().trim())
            .contactName(request.contactName().trim()).contactEmail(request.contactEmail().trim())
            .workDescription(request.workDescription().trim()).startDate(request.startDate()).endDate(request.endDate())
            .status("DRAFT").build();
        return response(applications.save(app));
    }

    @Transactional
    public StudentFoundResponse update(UUID id, StudentFoundRequest request) {
        var app = get(id);
        ResourceAuthorization.require(actor().getId().equals(app.getStudent().getId()));
        if (!List.of("DRAFT", "REVISION_REQUIRED", "REJECTED").contains(app.getStatus()))
            throw new BadRequestException("Hồ sơ đã nộp hoặc đã duyệt, không thể sửa");
        if (!app.getTerm().getId().equals(request.termId())
            || request.startDate().isAfter(request.endDate())
            || request.startDate().isBefore(app.getTerm().getStartDate())
            || request.endDate().isAfter(app.getTerm().getEndDate()))
            throw new BadRequestException("Kỳ hoặc thời gian thực tập không hợp lệ");
        app.setHostName(request.hostName().trim());
        app.setHostAddress(request.hostAddress().trim());
        app.setContactName(request.contactName().trim());
        app.setContactEmail(request.contactEmail().trim());
        app.setWorkDescription(request.workDescription().trim());
        app.setStartDate(request.startDate());
        app.setEndDate(request.endDate());
        app.setStatus("DRAFT");
        app.setAcceptanceDocument(null);
        app.setReviewNote(null);
        return response(applications.save(app));
    }

    @Transactional
    public StudentFoundResponse submit(UUID id, UUID documentId) {
        var app = get(id);
        ResourceAuthorization.require(actor().getId().equals(app.getStudent().getId()));
        if (!"DRAFT".equals(app.getStatus()) && !"REVISION_REQUIRED".equals(app.getStatus()))
            throw new BadRequestException("Hồ sơ không ở trạng thái được nộp");
        Document document = documents.findById(documentId).orElseThrow(() -> new ResourceNotFoundException("Document", "id", documentId));
        if (document.getContextType() != ContextType.SELF_FOUND || !document.getContextId().equals(id)
            || document.getDocumentType() != DocumentType.ACCEPTANCE_LETTER
            || !document.getOwner().getId().equals(app.getStudent().getId()) || !"ACTIVE".equals(document.getStatus()))
            throw new BadRequestException("Thư tiếp nhận phải là tài liệu hợp lệ của hồ sơ này");
        app.setAcceptanceDocument(document);
        app.setStatus("SUBMITTED");
        app.setReviewNote(null);
        var saved = applications.save(app);

        // Gửi thông báo cho cán bộ khoa quản lý khoa của kỳ thực tập
        var facultyAdmins = users.findByDepartmentIdAndRole(app.getTerm().getDepartment().getId(), UserRole.FACULTY_ADMIN);
        for (var admin : facultyAdmins) {
            notifications.sendNotification(
                admin.getId(),
                "STUDENT_FOUND_SUBMITTED",
                "Hồ sơ nơi thực tập tự tìm mới",
                "Sinh viên " + app.getStudent().getFullName() + " đã nộp hồ sơ thực tập tự tìm tại " + app.getHostName() + ".",
                "/faculty/job-approvals"
            );
        }

        return response(saved);
    }

    @Transactional
    public StudentFoundResponse review(UUID id, String decision, String note, UUID lecturerId) {
        var app = get(id);
        var reviewer = actor();
        ResourceAuthorization.require(ResourceAuthorization.managesDepartment(reviewer, app.getTerm().getDepartment().getId()));
        if (!"SUBMITTED".equals(app.getStatus())) throw new BadRequestException("Chỉ xét duyệt hồ sơ đã nộp");
        if (!List.of("APPROVED", "REJECTED", "REVISION_REQUIRED").contains(decision))
            throw new BadRequestException("Quyết định không hợp lệ");
        if (!"APPROVED".equals(decision) && (note == null || note.isBlank()))
            throw new BadRequestException("Cần nêu lý do khi từ chối hoặc yêu cầu sửa");
        if ("APPROVED".equals(decision)) {
            if (app.getAcceptanceDocument() == null || !"ACTIVE".equals(app.getAcceptanceDocument().getStatus()))
                throw new BadRequestException("Thiếu thư tiếp nhận hợp lệ");
            if (!placements.findByTermIdAndStudentId(app.getTerm().getId(), app.getStudent().getId()).isEmpty())
                throw new BadRequestException("Sinh viên đã có lần thực tập trong kỳ");
            if (lecturerId == null) throw new BadRequestException("Cần phân công giảng viên hướng dẫn");
            var lecturer = users.findById(lecturerId).orElseThrow(() -> new ResourceNotFoundException("User", "id", lecturerId));
            if (lecturer.getRole() != UserRole.LECTURER || lecturer.getDepartment() == null
                || !lecturer.getDepartment().getId().equals(app.getTerm().getDepartment().getId()))
                throw new BadRequestException("Giảng viên không thuộc đơn vị quản lý kỳ thực tập");
            var placement = InternshipPlacement.builder().studentFoundApplication(app).source("STUDENT_FOUND")
                .student(app.getStudent()).lecturer(lecturer).term(app.getTerm())
                .startDate(app.getStartDate()).endDate(app.getEndDate())
                .workSchedule(Map.of()).totalHoursWorked(BigDecimal.ZERO).status(PlacementStatus.PREPARING).build();
            placements.save(placement);

            notifications.sendNotification(
                app.getStudent().getId(),
                "STUDENT_FOUND_APPROVED",
                "Hồ sơ thực tập tự tìm đã được duyệt",
                "Hồ sơ thực tập tại " + app.getHostName() + " của bạn đã được phê duyệt.",
                "/student/applications"
            );
            notifications.sendNotification(
                lecturer.getId(),
                "LECTURER_ASSIGNED",
                "Phân công hướng dẫn thực tập",
                "Bạn đã được phân công hướng dẫn sinh viên " + app.getStudent().getFullName() + " tại " + app.getHostName() + ".",
                "/lecturer/supervision"
            );
        } else if ("REVISION_REQUIRED".equals(decision)) {
            notifications.sendNotification(
                app.getStudent().getId(),
                "STUDENT_FOUND_REVISION",
                "Yêu cầu chỉnh sửa hồ sơ thực tập tự tìm",
                "Hồ sơ tại " + app.getHostName() + " cần chỉnh sửa: " + note,
                "/student/applications"
            );
        } else if ("REJECTED".equals(decision)) {
            notifications.sendNotification(
                app.getStudent().getId(),
                "STUDENT_FOUND_REJECTED",
                "Hồ sơ thực tập tự tìm không được duyệt",
                "Hồ sơ tại " + app.getHostName() + " đã bị từ chối: " + note,
                "/student/applications"
            );
        }
        app.setStatus(decision);
        app.setReviewNote(note != null ? note.trim() : null);
        app.setReviewedBy(reviewer);
        app.setReviewedAt(OffsetDateTime.now());
        return response(applications.save(app));
    }

    @Transactional
    public int remindEligibleStudentsWithoutPlacement(UUID termId) {
        var term = terms.findById(termId).orElseThrow(() -> new ResourceNotFoundException("InternshipTerm", "id", termId));
        ResourceAuthorization.require(ResourceAuthorization.managesDepartment(actor(), term.getDepartment().getId()));

        List<StudentRoster> eligibleRosters = rosters.findByTermIdAndEligibilityStatus(termId, EligibilityStatus.ELIGIBLE);
        int count = 0;
        for (var roster : eligibleRosters) {
            if (roster.getClaimedUser() == null) continue;
            UUID studentId = roster.getClaimedUser().getId();
            boolean hasPlacement = !placements.findByTermIdAndStudentId(termId, studentId).isEmpty();
            if (hasPlacement) continue;

            var sfApp = applications.findByTermIdAndStudentId(termId, studentId);
            boolean alreadySubmittedSf = sfApp.isPresent() && List.of("SUBMITTED", "APPROVED").contains(sfApp.get().getStatus());
            if (alreadySubmittedSf) continue;

            notifications.sendNotification(
                studentId,
                "COMPANY_FORM_REMINDER",
                "Nhắc nhở: Cập nhật thông tin đơn vị thực tập",
                "Bạn chưa có vị trí thực tập trong kỳ " + term.getTermName() + ". Vui lòng nộp thông tin đơn vị thực tập tự tìm hoặc ứng tuyển các vị trí của trường.",
                "/student/applications"
            );
            count++;
        }
        return count;
    }

    @Transactional(readOnly = true)
    public List<StudentFoundResponse> mine() {
        return applications.findByStudentId(actor().getId()).stream().map(this::response).toList();
    }
    @Transactional(readOnly = true)
    public List<StudentFoundResponse> byTerm(UUID termId) {
        var term = terms.findById(termId).orElseThrow(() -> new ResourceNotFoundException("InternshipTerm", "id", termId));
        ResourceAuthorization.require(ResourceAuthorization.managesDepartment(actor(), term.getDepartment().getId()));
        return applications.findByTermId(termId).stream().map(this::response).toList();
    }
    @Transactional(readOnly = true)
    public StudentFoundResponse byId(UUID id) {
        var app = get(id);
        var user = actor();
        ResourceAuthorization.require(user.getId().equals(app.getStudent().getId())
            || ResourceAuthorization.managesDepartment(user, app.getTerm().getDepartment().getId())
            || user.getRole() == UserRole.LECTURER
                && placements.findByStudentFoundApplicationId(id)
                    .map(p -> p.getLecturer().getId().equals(user.getId())).orElse(false));
        return response(app);
    }
    private StudentFoundApplication get(UUID id) {
        return applications.findById(id).orElseThrow(() -> new ResourceNotFoundException("StudentFoundApplication", "id", id));
    }
    private com.internlink.core.domain.auth.User actor() {
        UUID id = security.currentUser().getId();
        return users.findById(id).orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
    }
    private StudentFoundResponse response(StudentFoundApplication a) {
        UUID placementId = placements.findByStudentFoundApplicationId(a.getId()).map(InternshipPlacement::getId).orElse(null);
        return new StudentFoundResponse(a.getId(), a.getTerm().getId(), a.getStudent().getId(), a.getHostName(),
            a.getHostAddress(), a.getContactName(), a.getContactEmail(), a.getWorkDescription(),
            a.getStartDate(), a.getEndDate(), a.getAcceptanceDocument() != null ? a.getAcceptanceDocument().getId() : null,
            a.getStatus(), a.getReviewNote(), placementId);
    }
}
