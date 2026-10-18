package com.internlink.core.application.organization.impl;

import com.internlink.core.application.system.AuditLogService;
import com.internlink.core.domain.auth.User;
import com.internlink.core.domain.organization.InternshipTerm;
import com.internlink.core.domain.organization.StudentRoster;
import com.internlink.core.infrastructure.persistence.jpa.JpaStudentRosterRepository;
import com.internlink.core.infrastructure.persistence.jpa.JpaUserRepository;
import com.internlink.core.presentation.organization.dto.response.BatchProvisionResponse;
import com.internlink.core.presentation.organization.dto.response.StudentRosterResponse;
import com.internlink.core.shared.enums.EligibilityStatus;
import com.internlink.core.shared.enums.UserRole;
import com.internlink.core.shared.exception.BadRequestException;
import com.internlink.core.shared.security.SecurityGuard;
import com.internlink.core.shared.util.SecurePasswordGenerator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Đảm nhiệm duy nhất 1 nhiệm vụ: Cấp tài khoản hệ thống (đơn lẻ hoặc hàng loạt) cho sinh viên đủ điều kiện,
 * tạo mật khẩu ngẫu nhiên bảo mật và kích hoạt gửi email thông báo.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class StudentRosterAccountProvisioner {

    private final JpaStudentRosterRepository rosterRepository;
    private final JpaUserRepository userRepository;
    private final SecurityGuard securityGuard;
    private final AuditLogService auditLogService;
    private final PasswordEncoder passwordEncoder;
    private final StudentProvisionEmailNotifier emailNotifier;

    public StudentRosterResponse provisionSingleAccount(StudentRoster roster, StudentRosterMapper mapper) {
        if (roster.getClaimedUser() != null) {
            throw new BadRequestException("Sinh viên này đã có tài khoản hệ thống (MSSV: " + roster.getStudentCode() + ")");
        }

        String email = roster.getOfficialEmail().trim().toLowerCase();
        if (userRepository.existsByEmail(email)) {
            User existing = userRepository.findByEmail(email).orElseThrow();
            roster.setClaimedUser(existing);
            roster.setClaimedAt(OffsetDateTime.now());
            rosterRepository.save(roster);
            auditLogService.logAction(
                    securityGuard.currentUser().getId(), "LINK_ROSTER_TO_EXISTING_USER",
                    "StudentRoster", roster.getId(), "SUCCESS",
                    Map.of("studentCode", roster.getStudentCode(), "userId", existing.getId()), null);
            return mapper.mapToResponse(roster);
        }

        String rawPassword = SecurePasswordGenerator.generateRandomPassword(10);
        User newUser = User.builder()
                .email(email)
                .fullName(roster.getFullName())
                .passwordHash(passwordEncoder.encode(rawPassword))
                .role(UserRole.STUDENT)
                .department(roster.getTerm().getDepartment())
                .mustChangePassword(true)
                .isActive(true)
                .build();
        User saved = userRepository.save(newUser);

        roster.setClaimedUser(saved);
        roster.setClaimedAt(OffsetDateTime.now());
        rosterRepository.save(roster);

        // Gửi email chứa mật khẩu ngẫu nhiên về hòm thư sinh viên
        emailNotifier.sendProvisionEmail(email, roster.getFullName(), roster.getStudentCode(), rawPassword, roster.getTerm().getTermName());

        auditLogService.logAction(
                securityGuard.currentUser().getId(), "PROVISION_STUDENT_ACCOUNT",
                "StudentRoster", roster.getId(), "SUCCESS",
                Map.of("studentCode", roster.getStudentCode(), "email", email), null);

        StudentRosterResponse result = mapper.mapToResponse(roster);
        result.setDefaultPassword(rawPassword);
        return result;
    }

    public BatchProvisionResponse batchProvisionEligible(InternshipTerm term, UUID actorId) {
        List<StudentRoster> eligibleWithoutAccount = rosterRepository.findByTermId(term.getId()).stream()
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
                String rawPassword = SecurePasswordGenerator.generateRandomPassword(10);
                User newUser = User.builder()
                        .email(email)
                        .fullName(roster.getFullName())
                        .passwordHash(passwordEncoder.encode(rawPassword))
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

                // Gửi email mật khẩu ngẫu nhiên
                emailNotifier.sendProvisionEmail(email, roster.getFullName(), roster.getStudentCode(), rawPassword, term.getTermName());

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
        auditLogService.logAction(
                actorId, "BATCH_PROVISION_STUDENT_ACCOUNTS", "InternshipTerm", term.getId(), "SUCCESS",
                Map.of("total", eligibleWithoutAccount.size(), "newlyCreated", newlyCreated, "linkedExisting", linkedExisting), null);

        return BatchProvisionResponse.builder()
                .totalEligibleWithoutAccount(eligibleWithoutAccount.size())
                .newlyCreatedCount(newlyCreated)
                .linkedExistingCount(linkedExisting)
                .accounts(accountDtos)
                .build();
    }
}
