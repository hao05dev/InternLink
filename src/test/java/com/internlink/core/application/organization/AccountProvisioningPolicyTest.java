package com.internlink.core.application.organization;

import com.internlink.core.application.auth.AccountActivationTokenService;
import com.internlink.core.application.organization.impl.*;
import com.internlink.core.application.system.AuditLogService;
import com.internlink.core.domain.auth.User;
import com.internlink.core.domain.organization.*;
import com.internlink.core.infrastructure.persistence.jpa.*;
import com.internlink.core.presentation.organization.dto.request.CreateLecturerRequest;
import com.internlink.core.shared.enums.*;
import com.internlink.core.shared.security.SecurityGuard;
import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.password.PasswordEncoder;
import java.util.*;
import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

class AccountProvisioningPolicyTest {
    @Test void rosterCannotLinkAnAdminAccount() {
        var users = mock(JpaUserRepository.class);
        var profiles = mock(JpaStudentProfileRepository.class);
        var rosters = mock(JpaStudentRosterRepository.class);
        var provisioner = new StudentRosterAccountProvisioner(rosters, users, mock(SecurityGuard.class),
                mock(AuditLogService.class), mock(PasswordEncoder.class), mock(StudentProvisionEmailNotifier.class),
                profiles, mock(AccountActivationTokenService.class));
        var roster = StudentRoster.builder().officialEmail("admin@example.test").eligibilityStatus(EligibilityStatus.ELIGIBLE).build();
        var admin = User.builder().role(UserRole.ADMIN).email("admin@example.test").build();
        when(users.existsByEmail("admin@example.test")).thenReturn(true);
        when(users.findByEmail("admin@example.test")).thenReturn(Optional.of(admin));
        assertThatThrownBy(() -> provisioner.provisionSingleAccount(roster, new StudentRosterMapper()))
                .hasMessageContaining("khác vai trò");
        assertThat(admin.getRole()).isEqualTo(UserRole.ADMIN);
        verifyNoInteractions(profiles);
        verifyNoInteractions(rosters);
    }
    @Test void lecturerProvisionCannotChangeAnExistingAdminsRole() {
        var users = mock(JpaUserRepository.class);
        var departments = mock(JpaDepartmentRepository.class);
        var service = new FacultyLecturerManagementServiceImpl(users, departments, mock(JpaInternshipTermRepository.class),
                mock(JpaFacultyLecturerQuotaRepository.class), mock(JpaInternshipPlacementRepository.class),
                mock(PasswordEncoder.class), mock(LecturerProvisionEmailNotifier.class), mock(AuditLogService.class),
                mock(AccountActivationTokenService.class));
        var department = Department.builder().name("IT").build();
        department.setId(UUID.randomUUID());
        var admin = User.builder().role(UserRole.ADMIN).email("admin@example.test").build();
        when(departments.findById(department.getId())).thenReturn(Optional.of(department));
        when(users.findByEmail("admin@example.test")).thenReturn(Optional.of(admin));
        assertThatThrownBy(() -> service.createLecturer(department.getId(), null,
                CreateLecturerRequest.builder().email("admin@example.test").fullName("Admin").build(), UUID.randomUUID()))
                .hasMessageContaining("khác vai trò");
        assertThat(admin.getRole()).isEqualTo(UserRole.ADMIN);
        verify(users, never()).save(any());
    }
}
