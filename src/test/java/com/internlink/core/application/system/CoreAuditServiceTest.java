package com.internlink.core.application.system;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;

import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.internlink.core.application.system.impl.AuditLogServiceImpl;
import com.internlink.core.domain.system.AuditLog;
import com.internlink.core.infrastructure.persistence.jpa.JpaAuditLogRepository;
import com.internlink.core.infrastructure.persistence.jpa.JpaUserRepository;

@ExtendWith(MockitoExtension.class)
class CoreAuditServiceTest {

    @Mock
    private JpaAuditLogRepository auditRepository;

    @Mock
    private JpaUserRepository userRepository;

    @Test
    void auditLogSupportsSystemActor() {
        AuditLogServiceImpl service = new AuditLogServiceImpl(auditRepository, userRepository);

        service.logAction(null, "SYNC", "Job", UUID.randomUUID(), "SUCCESS", null, "127.0.0.1");

        var captor = ArgumentCaptor.forClass(AuditLog.class);
        verify(auditRepository).save(captor.capture());
        assertThat(captor.getValue().getActorUser()).isNull();
        assertThat(captor.getValue().getChangedFields()).isEmpty();
    }
}
