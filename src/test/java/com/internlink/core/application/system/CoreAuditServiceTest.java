package com.internlink.core.application.system;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.lang.reflect.Field;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.internlink.core.application.system.impl.AuditLogServiceImpl;
import com.internlink.core.domain.auth.User;
import com.internlink.core.domain.system.AuditLog;
import com.internlink.core.infrastructure.persistence.jpa.JpaAuditLogRepository;
import com.internlink.core.infrastructure.persistence.jpa.JpaAuthSessionFamilyRepository;
import com.internlink.core.infrastructure.persistence.jpa.JpaUserRepository;
import com.internlink.core.presentation.system.dto.response.LoginStatsResponse;
import com.internlink.core.shared.enums.UserRole;

@ExtendWith(MockitoExtension.class)
class CoreAuditServiceTest {

    @Mock
    private JpaAuditLogRepository auditRepository;

    @Mock
    private JpaUserRepository userRepository;

    @Mock
    private JpaAuthSessionFamilyRepository sessionFamilyRepository;

    @Test
    void auditLogSupportsSystemActor() {
        AuditLogServiceImpl service = new AuditLogServiceImpl(auditRepository, userRepository);

        service.logAction(null, "SYNC", "Job", UUID.randomUUID(), "SUCCESS", null, "127.0.0.1");

        var captor = ArgumentCaptor.forClass(AuditLog.class);
        verify(auditRepository).save(captor.capture());
        assertThat(captor.getValue().getActorUser()).isNull();
        assertThat(captor.getValue().getChangedFields()).isEmpty();
    }

    @Test
    void getLoginStatsCalculatesMetricsCorrectly() throws Exception {
        AuditLogServiceImpl service = new AuditLogServiceImpl(auditRepository, userRepository);
        Field field = AuditLogServiceImpl.class.getDeclaredField("sessionFamilyRepository");
        field.setAccessible(true);
        field.set(service, sessionFamilyRepository);

        User student = User.builder().role(UserRole.STUDENT).build();
        student.setId(UUID.randomUUID());
        User admin = User.builder().role(UserRole.ADMIN).build();
        admin.setId(UUID.randomUUID());

        AuditLog log1 = AuditLog.builder()
                .action("USER_LOGIN")
                .result("SUCCESS")
                .actorUser(student)
                .createdAt(OffsetDateTime.now())
                .build();
        AuditLog log2 = AuditLog.builder()
                .action("USER_LOGIN")
                .result("SUCCESS")
                .actorUser(admin)
                .createdAt(OffsetDateTime.now())
                .build();
        AuditLog log3 = AuditLog.builder()
                .action("USER_LOGIN_FAILED")
                .result("FAILURE")
                .createdAt(OffsetDateTime.now())
                .build();

        when(auditRepository.findByActionInAndCreatedAtAfterOrderByCreatedAtDesc(any(), any()))
                .thenReturn(List.of(log1, log2, log3));
        when(sessionFamilyRepository.countByRevokedAtIsNullAndAbsoluteExpiresAtAfter(any()))
                .thenReturn(42L);

        LoginStatsResponse stats = service.getLoginStats();

        assertThat(stats.getTodayLogins()).isEqualTo(3);
        assertThat(stats.getTodaySuccessfulLogins()).isEqualTo(2);
        assertThat(stats.getTodayFailedLogins()).isEqualTo(1);
        assertThat(stats.getTodayUniqueUsers()).isEqualTo(2);
        assertThat(stats.getActiveSessionsCount()).isEqualTo(42);
        assertThat(stats.getDailyStats()).hasSize(7);
        assertThat(stats.getRoleBreakdown()).containsEntry("STUDENT", 1L);
        assertThat(stats.getRoleBreakdown()).containsEntry("ADMIN", 1L);
    }
}
