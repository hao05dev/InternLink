package com.internlink.core.application.ai_matching;

import com.internlink.core.application.system.AuditLogService;
import com.internlink.core.domain.ai_matching.AiRun;
import com.internlink.core.infrastructure.integration.ai.AiServiceClient;
import com.internlink.core.infrastructure.persistence.jpa.JpaAiRunRepository;
import com.internlink.core.infrastructure.persistence.jpa.JpaSkillTaxonomyRepository;
import com.internlink.core.infrastructure.security.CustomUserDetail;
import com.internlink.core.shared.enums.*;
import com.internlink.core.shared.exception.BadRequestException;
import com.internlink.core.shared.exception.ForbiddenException;
import com.internlink.core.shared.security.SecurityGuard;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AdminAiServiceTest {
    @Mock JpaAiRunRepository runRepository;
    @Mock JpaSkillTaxonomyRepository taxonomyRepository;
    @Mock AiServiceClient aiServiceClient;
    @Mock AiMatchingService matchingService;
    @Mock SecurityGuard securityGuard;
    @Mock AuditLogService auditLogService;
    @InjectMocks AdminAiService service;

    @Test
    void deniesNonAdminBeforeReadingAiData() {
        doThrow(new ForbiddenException("Forbidden")).when(securityGuard).requireRole(UserRole.ADMIN);
        assertThatThrownBy(() -> service.stats()).isInstanceOf(ForbiddenException.class);
        assertThatThrownBy(() -> service.health()).isInstanceOf(ForbiddenException.class);
        assertThatThrownBy(() -> service.runs(null, null, null, 0, 20)).isInstanceOf(ForbiddenException.class);
        assertThatThrownBy(() -> service.detail(UUID.randomUUID())).isInstanceOf(ForbiddenException.class);
        assertThatThrownBy(() -> service.taxonomy()).isInstanceOf(ForbiddenException.class);
        assertThatThrownBy(() -> service.retry(UUID.randomUUID(), "Java")).isInstanceOf(ForbiddenException.class);
        verifyNoInteractions(runRepository, taxonomyRepository, aiServiceClient, matchingService);
    }

    @Test
    void rejectsInvalidPaginationBeforeDatabaseQuery() {
        assertThatThrownBy(() -> service.runs(null, null, null, -1, 20)).isInstanceOf(BadRequestException.class);
        assertThatThrownBy(() -> service.runs(null, null, null, 0, 101)).isInstanceOf(BadRequestException.class);
        verifyNoInteractions(runRepository);
    }

    @Test
    void reportsUnavailableServiceWithoutClaimingGeminiIsConfigured() {
        when(aiServiceClient.health()).thenReturn(Map.of("status", "unavailable"));
        var health = service.health();
        assertThat(health.available()).isFalse();
        assertThat(health.geminiConfigured()).isFalse();
        assertThat(health.checkedAt()).isNotNull();
    }

    @Test
    void failedRetryIsAuditedAsFailureAndReturnedForInspection() {
        UUID originalId = UUID.randomUUID(), newId = UUID.randomUUID(), actorId = UUID.randomUUID();
        when(matchingService.reprocessFailedCvRun(originalId, "Java")).thenReturn(newId);
        when(runRepository.findById(newId)).thenReturn(Optional.of(AiRun.builder().id(newId)
            .runType(AiRunType.CV_EXTRACTION).status(AiRunStatus.FAILED).inputSnapshot(Map.of()).build()));
        when(securityGuard.currentUser()).thenReturn(CustomUserDetail.builder().id(actorId).role(UserRole.ADMIN).build());
        var result = service.retry(originalId, "Java");
        assertThat(result.run().status()).isEqualTo(AiRunStatus.FAILED);
        verify(auditLogService).logAction(eq(actorId), eq("AI_CV_RETRY"), eq("AI_RUN"), eq(newId),
            eq("FAILED"), eq(Map.of("retryOf", originalId.toString())), isNull());
    }
}
