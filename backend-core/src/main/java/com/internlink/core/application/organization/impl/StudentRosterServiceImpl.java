package com.internlink.core.application.organization.impl;

import com.internlink.core.application.organization.StudentRosterService;
import com.internlink.core.application.system.AuditLogService;
import com.internlink.core.domain.auth.User;
import com.internlink.core.domain.organization.AcademicProgram;
import com.internlink.core.domain.organization.InternshipTerm;
import com.internlink.core.domain.organization.StudentRoster;
import com.internlink.core.infrastructure.persistence.jpa.JpaAcademicProgramRepository;
import com.internlink.core.infrastructure.persistence.jpa.JpaInternshipTermRepository;
import com.internlink.core.infrastructure.persistence.jpa.JpaStudentRosterRepository;
import com.internlink.core.infrastructure.persistence.jpa.JpaUserRepository;
import com.internlink.core.application.system.NotificationService;
import com.internlink.core.infrastructure.integration.google.GmailSender;
import com.internlink.core.presentation.organization.dto.request.IneligibleNoticeRequest;
import com.internlink.core.presentation.organization.dto.request.StudentRosterImportItem;
import com.internlink.core.presentation.organization.dto.response.BatchProvisionResponse;
import com.internlink.core.presentation.organization.dto.response.IneligibleNoticeResponse;
import com.internlink.core.presentation.organization.dto.response.StudentRosterResponse;
import com.internlink.core.shared.enums.EligibilityStatus;
import com.internlink.core.shared.enums.UserRole;
import com.internlink.core.shared.exception.BadRequestException;
import com.internlink.core.shared.exception.ResourceNotFoundException;
import com.internlink.core.shared.security.ResourceAuthorization;
import com.internlink.core.shared.security.SecurityGuard;
import com.internlink.core.shared.security.TermGuard;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class StudentRosterServiceImpl implements StudentRosterService {

    private final JpaStudentRosterRepository rosterRepository;
    private final JpaInternshipTermRepository termRepository;
    private final JpaAcademicProgramRepository programRepository;
    private final JpaUserRepository userRepository;
    private final SecurityGuard securityGuard;
    private final AuditLogService auditLogService;
    private final PasswordEncoder passwords;
    private final GmailSender gmailSender;
    private final NotificationService notificationService;

    @Override
    @Transactional(readOnly = true)
    public List<StudentRosterResponse> getRostersByTerm(UUID termId) {
        InternshipTerm term = termRepository.findById(termId)
            .orElseThrow(() -> new ResourceNotFoundException("InternshipTerm", "id", termId));
        var actor = userRepository.findById(securityGuard.currentUser().getId()).orElseThrow();
        ResourceAuthorization.require(ResourceAuthorization.managesDepartment(actor, term.getDepartment().getId())
            || actor.getRole() == com.internlink.core.shared.enums.UserRole.LECTURER
                && actor.getDepartment() != null && actor.getDepartment().getId().equals(term.getDepartment().getId()));
        return rosterRepository.findByTermId(termId).stream()
            .map(this::mapToResponse)
            .toList();
    }

    @Override
    @Transactional
    public List<StudentRosterResponse> importRosterList(UUID termId, List<StudentRosterImportItem> items) {
        InternshipTerm term = termRepository.findById(termId)
            .orElseThrow(() -> new ResourceNotFoundException("InternshipTerm", "id", termId));
        TermGuard.requireNotClosed(term);
        ResourceAuthorization.require(ResourceAuthorization.managesDepartment(
            userRepository.findById(securityGuard.currentUser().getId()).orElseThrow(), term.getDepartment().getId()));
        if (items.isEmpty()) throw new com.internlink.core.shared.exception.BadRequestException("Danh sách import trống");

        List<StudentRoster> rostersToSave = new ArrayList<>();

        for (StudentRosterImportItem item : items) {
            if (item.getProgramId() == null || item.getStudentCode() == null || item.getStudentCode().isBlank()
                || item.getFullName() == null || item.getFullName().isBlank()
                || item.getOfficialEmail() == null || !item.getOfficialEmail().matches("^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$")
                || item.getAcademicYear() == null || item.getAcademicYear().isBlank())
                throw new com.internlink.core.shared.exception.BadRequestException("Dòng roster thiếu MSSV, họ tên, email, khóa hoặc ngành học");
            AcademicProgram program = programRepository.findById(item.getProgramId())
                .orElseThrow(() -> new ResourceNotFoundException("AcademicProgram", "id", item.getProgramId()));

            if (!program.getDepartment().getId().equals(term.getDepartment().getId())) {
                throw new com.internlink.core.shared.exception.BadRequestException(
                    "Ngành học không thuộc khoa quản lý kỳ thực tập");
            }

            // Nếu đã tồn tại trong kỳ thì cập nhật, nếu chưa thì tạo mới
            StudentRoster roster = rosterRepository
                .findByTermIdAndStudentCode(termId, item.getStudentCode().trim().toUpperCase())
                .orElse(StudentRoster.builder()
                    .term(term)
                    .studentCode(item.getStudentCode().trim().toUpperCase())
                    .build());

            roster.setProgram(program);
            roster.setOfficialEmail(item.getOfficialEmail().trim().toLowerCase());
            roster.setFullName(item.getFullName().trim());
            roster.setAcademicYear(item.getAcademicYear().trim());
            roster.setClassCode(item.getClassCode() != null ? item.getClassCode().trim() : null);
            if (item.getInternshipCourseCode() == null || item.getInternshipCourseCode().isBlank())
                throw new com.internlink.core.shared.exception.BadRequestException("Cần mã học phần thực tập theo chương trình đào tạo");
            roster.setInternshipCourseCode(item.getInternshipCourseCode().trim().toUpperCase());
            roster.setEligibilityStatus(item.getEligibilityStatus());
            roster.setEligibilityNote(item.getEligibilityNote());

            rostersToSave.add(roster);
        }

        List<StudentRoster> saved = rosterRepository.saveAll(rostersToSave);
        auditLogService.logAction(securityGuard.currentUser().getId(), "IMPORT_STUDENT_ROSTER",
            "InternshipTerm", termId, "SUCCESS", Map.of("count", saved.size()), null);
        return saved.stream()
            .map(this::mapToResponse)
            .toList();
    }

    @Override
    @Transactional
    public StudentRosterResponse provisionAccount(UUID rosterId) {
        StudentRoster roster = rosterRepository.findById(rosterId)
            .orElseThrow(() -> new ResourceNotFoundException("StudentRoster", "id", rosterId));
        TermGuard.requireNotClosed(roster.getTerm());

        var actor = userRepository.findById(securityGuard.currentUser().getId()).orElseThrow();
        ResourceAuthorization.require(ResourceAuthorization.managesDepartment(actor, roster.getTerm().getDepartment().getId()));

        if (roster.getClaimedUser() != null) {
            throw new BadRequestException("Sinh viên này đã có tài khoản hệ thống (MSSV: " + roster.getStudentCode() + ")");
        }

        String email = roster.getOfficialEmail().trim().toLowerCase();
        if (userRepository.existsByEmail(email)) {
            // Link existing account instead of creating new
            User existing = userRepository.findByEmail(email).orElseThrow();
            roster.setClaimedUser(existing);
            roster.setClaimedAt(OffsetDateTime.now());
            rosterRepository.save(roster);
            auditLogService.logAction(securityGuard.currentUser().getId(), "LINK_ROSTER_TO_EXISTING_USER",
                "StudentRoster", rosterId, "SUCCESS", Map.of("studentCode", roster.getStudentCode(), "userId", existing.getId()), null);
            return mapToResponse(roster);
        }

        // Generate default password: Internlink@ + last 6 chars of studentCode
        String code = roster.getStudentCode();
        String suffix = code.length() >= 6 ? code.substring(code.length() - 6) : code;
        String rawPassword = "Internlink@" + suffix;

        User newUser = User.builder()
            .email(email)
            .fullName(roster.getFullName())
            .passwordHash(passwords.encode(rawPassword))
            .role(UserRole.STUDENT)
            .department(roster.getTerm().getDepartment())
            .mustChangePassword(true)
            .isActive(true)
            .build();
        User saved = userRepository.save(newUser);

        roster.setClaimedUser(saved);
        roster.setClaimedAt(OffsetDateTime.now());
        rosterRepository.save(roster);

        auditLogService.logAction(securityGuard.currentUser().getId(), "PROVISION_STUDENT_ACCOUNT",
            "StudentRoster", rosterId, "SUCCESS", Map.of("studentCode", roster.getStudentCode(), "email", email), null);

        StudentRosterResponse result = mapToResponse(roster);
        result.setDefaultPassword(rawPassword); // so faculty can see/copy it
        return result;
    }

    @Override
    @Transactional
    public BatchProvisionResponse batchProvisionEligibleAccounts(UUID termId) {
        InternshipTerm term = termRepository.findById(termId)
            .orElseThrow(() -> new ResourceNotFoundException("InternshipTerm", "id", termId));
        TermGuard.requireNotClosed(term);

        var actor = userRepository.findById(securityGuard.currentUser().getId()).orElseThrow();
        ResourceAuthorization.require(ResourceAuthorization.managesDepartment(actor, term.getDepartment().getId()));

        List<StudentRoster> eligibleWithoutAccount = rosterRepository.findByTermId(termId).stream()
            .filter(r -> r.getEligibilityStatus() == EligibilityStatus.ELIGIBLE && r.getClaimedUser() == null)
            .toList();

        if (eligibleWithoutAccount.isEmpty()) {
            return BatchProvisionResponse.builder()
                .totalEligibleWithoutAccount(0)
                .newlyCreatedCount(0)
                .linkedExistingCount(0)
                .accounts(List.of())
                .build();
        }

        int newlyCreated = 0;
        int linkedExisting = 0;
        List<BatchProvisionResponse.ProvisionedStudentAccountDto> accountDtos = new ArrayList<>();
        List<StudentRoster> rostersToUpdate = new ArrayList<>();

        for (StudentRoster roster : eligibleWithoutAccount) {
            String email = roster.getOfficialEmail().trim().toLowerCase();
            if (userRepository.existsByEmail(email)) {
                User existing = userRepository.findByEmail(email).orElseThrow();
                roster.setClaimedUser(existing);
                roster.setClaimedAt(OffsetDateTime.now());
                rostersToUpdate.add(roster);
                linkedExisting++;
                accountDtos.add(BatchProvisionResponse.ProvisionedStudentAccountDto.builder()
                    .studentCode(roster.getStudentCode())
                    .fullName(roster.getFullName())
                    .officialEmail(email)
                    .defaultPassword(null)
                    .isNewlyCreated(false)
                    .build());
            } else {
                String code = roster.getStudentCode();
                String suffix = code.length() >= 6 ? code.substring(code.length() - 6) : code;
                String rawPassword = "Internlink@" + suffix;

                User newUser = User.builder()
                    .email(email)
                    .fullName(roster.getFullName())
                    .passwordHash(passwords.encode(rawPassword))
                    .role(UserRole.STUDENT)
                    .department(term.getDepartment())
                    .mustChangePassword(true)
                    .isActive(true)
                    .build();
                User saved = userRepository.save(newUser);

                roster.setClaimedUser(saved);
                roster.setClaimedAt(OffsetDateTime.now());
                rostersToUpdate.add(roster);
                newlyCreated++;
                accountDtos.add(BatchProvisionResponse.ProvisionedStudentAccountDto.builder()
                    .studentCode(roster.getStudentCode())
                    .fullName(roster.getFullName())
                    .officialEmail(email)
                    .defaultPassword(rawPassword)
                    .isNewlyCreated(true)
                    .build());
            }
        }

        rosterRepository.saveAll(rostersToUpdate);
        auditLogService.logAction(securityGuard.currentUser().getId(), "BATCH_PROVISION_STUDENT_ACCOUNTS",
            "InternshipTerm", termId, "SUCCESS", Map.of(
                "total", eligibleWithoutAccount.size(),
                "newlyCreated", newlyCreated,
                "linkedExisting", linkedExisting
            ), null);

        return BatchProvisionResponse.builder()
            .totalEligibleWithoutAccount(eligibleWithoutAccount.size())
            .newlyCreatedCount(newlyCreated)
            .linkedExistingCount(linkedExisting)
            .accounts(accountDtos)
            .build();
    }

    @Override
    @Transactional(readOnly = true)
    public IneligibleNoticeResponse notifyIneligibleStudents(UUID termId, IneligibleNoticeRequest request) {
        InternshipTerm term = termRepository.findById(termId)
            .orElseThrow(() -> new ResourceNotFoundException("InternshipTerm", "id", termId));
        TermGuard.requireNotClosed(term);

        var actor = userRepository.findById(securityGuard.currentUser().getId()).orElseThrow();
        ResourceAuthorization.require(ResourceAuthorization.managesDepartment(actor, term.getDepartment().getId()));

        List<StudentRoster> ineligibleRosters = rosterRepository.findByTermId(termId).stream()
            .filter(r -> r.getEligibilityStatus() == EligibilityStatus.INELIGIBLE 
                      || r.getEligibilityStatus() == EligibilityStatus.NEEDS_REVIEW)
            .toList();

        if (ineligibleRosters.isEmpty()) {
            throw new BadRequestException("Không có sinh viên nào có trạng thái chưa đủ điều kiện trong kỳ này");
        }

        String subjectTemplate = request.getEmailSubjectTemplate() != null && !request.getEmailSubjectTemplate().isBlank()
            ? request.getEmailSubjectTemplate()
            : "Thông báo về điều kiện tham gia thực tập - {{termName}}";

        String bodyTemplate = request.getEmailBodyTemplate() != null && !request.getEmailBodyTemplate().isBlank()
            ? request.getEmailBodyTemplate()
            : """
              Kính gửi sinh viên {{studentName}} (MSSV: {{studentCode}}),
              
              Khoa thông báo: Hồ sơ đăng ký thực tập kỳ {{termName}} của bạn hiện CHƯA ĐỦ ĐIỀU KIỆN.
              Lý do / Ghi chú: {{eligibilityNote}}
              
              Hạn chót để bổ sung điều kiện / minh chứng: {{supplementDeadline}}
              Địa điểm / Kênh tiếp nhận: {{contactInfo}}
              
              Vui lòng liên hệ Văn phòng Khoa để được hỗ trợ chuyển đổi trạng thái sang ĐỦ ĐIỀU KIỆN trước khi hết hạn.
              """;

        String deadline = request.getSupplementDeadline() != null && !request.getSupplementDeadline().isBlank()
            ? request.getSupplementDeadline()
            : (term.getRegistrationCloseAt() != null ? term.getRegistrationCloseAt().toLocalDate().toString() : "Hết thời gian mở đăng ký");
        String contact = request.getContactInfo() != null && !request.getContactInfo().isBlank()
            ? request.getContactInfo()
            : "Văn phòng Khoa / Cố vấn học tập";

        int emailsSent = 0;
        int inAppNotifs = 0;
        List<String> failedCodes = new ArrayList<>();

        for (StudentRoster roster : ineligibleRosters) {
            String note = roster.getEligibilityNote() != null && !roster.getEligibilityNote().isBlank()
                ? roster.getEligibilityNote()
                : "Chưa tích lũy đủ tín chỉ hoặc chưa hoàn thành học phần tiên quyết theo quy chế";

            String subject = subjectTemplate
                .replace("{{studentName}}", roster.getFullName())
                .replace("{{studentCode}}", roster.getStudentCode())
                .replace("{{termName}}", term.getTermName());

            String body = bodyTemplate
                .replace("{{studentName}}", roster.getFullName())
                .replace("{{studentCode}}", roster.getStudentCode())
                .replace("{{termName}}", term.getTermName())
                .replace("{{eligibilityNote}}", note)
                .replace("{{supplementDeadline}}", deadline)
                .replace("{{contactInfo}}", contact);

            try {
                gmailSender.send(roster.getOfficialEmail(), subject, body);
                emailsSent++;
            } catch (RuntimeException err) {
                failedCodes.add(roster.getStudentCode());
            }

            UUID recipientUserId = roster.getClaimedUser() != null ? roster.getClaimedUser().getId()
                : userRepository.findByEmail(roster.getOfficialEmail()).map(User::getId).orElse(null);

            if (recipientUserId != null) {
                notificationService.sendNotification(
                    recipientUserId,
                    "INELIGIBLE_ROSTER_ALERT",
                    subject,
                    body,
                    "/student/dashboard"
                );
                inAppNotifs++;
            }
        }

        auditLogService.logAction(securityGuard.currentUser().getId(), "NOTIFY_INELIGIBLE_STUDENTS",
            "InternshipTerm", termId, failedCodes.isEmpty() ? "SUCCESS" : "PARTIAL", Map.of(
                "totalIneligible", ineligibleRosters.size(),
                "emailsSent", emailsSent,
                "notificationsCreated", inAppNotifs
            ), null);

        return IneligibleNoticeResponse.builder()
            .totalIneligible(ineligibleRosters.size())
            .emailsSent(emailsSent)
            .notificationsCreated(inAppNotifs)
            .failedStudentCodes(failedCodes)
            .build();
    }

    private StudentRosterResponse mapToResponse(StudentRoster entity) {
        return StudentRosterResponse.builder()
            .id(entity.getId())
            .termId(entity.getTerm().getId())
            .termName(entity.getTerm().getTermName())
            .programId(entity.getProgram().getId())
            .programName(entity.getProgram().getName())
            .studentCode(entity.getStudentCode())
            .officialEmail(entity.getOfficialEmail())
            .fullName(entity.getFullName())
            .academicYear(entity.getAcademicYear())
            .classCode(entity.getClassCode())
            .internshipCourseCode(entity.getInternshipCourseCode())
            .eligibilityStatus(entity.getEligibilityStatus())
            .eligibilityNote(entity.getEligibilityNote())
            .claimedUserId(entity.getClaimedUser() != null ? entity.getClaimedUser().getId() : null)
            .claimedAt(entity.getClaimedAt())
            .createdAt(entity.getCreatedAt())
            .build();
    }
}
