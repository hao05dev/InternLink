package com.internlink.core.application.system.impl;

import com.internlink.core.application.system.AuditLogService;
import com.internlink.core.domain.auth.User;
import com.internlink.core.domain.system.AuditLog;
import com.internlink.core.infrastructure.persistence.jpa.JpaAuditLogRepository;
import com.internlink.core.infrastructure.persistence.jpa.JpaAuthSessionFamilyRepository;
import com.internlink.core.infrastructure.persistence.jpa.JpaUserRepository;
import com.internlink.core.presentation.system.dto.response.AuditLogResponse;
import com.internlink.core.presentation.system.dto.response.LoginStatsResponse;
import com.internlink.core.presentation.system.dto.response.LoginStatsResponse.DailyLoginStatDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuditLogServiceImpl implements AuditLogService {

    private final JpaAuditLogRepository auditLogRepository;
    private final JpaUserRepository userRepository;

    @Autowired(required = false)
    private JpaAuthSessionFamilyRepository sessionFamilyRepository;

    private static final List<String> LOGIN_ACTIONS = List.of("USER_LOGIN", "USER_LOGIN_FAILED");
    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    @Override
    @Transactional(readOnly = true)
    public List<AuditLogResponse> getAllLogs() {
        return auditLogRepository.findAllByOrderByCreatedAtDesc().stream()
            .map(this::mapToResponse)
            .toList();
    }

    @Override
    @Transactional
    public void logAction(
        UUID actorId,
        String action,
        String entityType,
        UUID entityId,
        String result,
        Map<String, Object> changedFields,
        String ipAddress
    ) {
        logAction(actorId, action, entityType, entityId, result, changedFields, ipAddress, null, Map.of());
    }

    @Override
    @Transactional
    public void logAction(
        UUID actorId,
        String action,
        String entityType,
        UUID entityId,
        String result,
        Map<String, Object> changedFields,
        String ipAddress,
        String userAgent,
        Map<String, Object> metadata
    ) {
        try {
            User actor = (actorId != null) ? userRepository.findById(actorId).orElse(null) : null;
            String sanitizedIp = sanitizeIp(ipAddress);
            String normalizedResult = "FAILURE".equalsIgnoreCase(result) ? "FAILURE" : "SUCCESS";

            AuditLog logEntry = AuditLog.builder()
                .actorUser(actor)
                .action(action)
                .entityType(entityType)
                .entityId(entityId)
                .result(normalizedResult)
                .ipAddress(sanitizedIp)
                .userAgent(userAgent)
                .changedFields(changedFields != null ? changedFields : Map.of())
                .metadata(metadata != null ? metadata : Map.of())
                .build();

            auditLogRepository.save(logEntry);
        } catch (Exception ex) {
            log.error("Không thể ghi audit log cho hành động [{}]: {}", action, ex.getMessage(), ex);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public LoginStatsResponse getLoginStats() {
        OffsetDateTime now = OffsetDateTime.now();
        OffsetDateTime sevenDaysAgo = now.minusDays(7).withHour(0).withMinute(0).withSecond(0).withNano(0);
        LocalDate today = now.toLocalDate();

        List<AuditLog> recentLogs = auditLogRepository
            .findByActionInAndCreatedAtAfterOrderByCreatedAtDesc(LOGIN_ACTIONS, sevenDaysAgo);

        long todayTotal = 0;
        long todaySuccess = 0;
        long todayFailed = 0;
        Set<UUID> todayUserIds = new HashSet<>();
        Map<String, Long> roleCounts = new HashMap<>();

        Map<LocalDate, List<AuditLog>> logsByDate = recentLogs.stream()
            .collect(Collectors.groupingBy(log -> log.getCreatedAt().toLocalDate()));

        for (AuditLog logItem : recentLogs) {
            LocalDate logDate = logItem.getCreatedAt().toLocalDate();
            boolean isSuccess = "SUCCESS".equalsIgnoreCase(logItem.getResult());

            if (logDate.equals(today)) {
                todayTotal++;
                if (isSuccess) {
                    todaySuccess++;
                    if (logItem.getActorUser() != null) {
                        todayUserIds.add(logItem.getActorUser().getId());
                        if (logItem.getActorUser().getRole() != null) {
                            String roleName = logItem.getActorUser().getRole().name();
                            roleCounts.put(roleName, roleCounts.getOrDefault(roleName, 0L) + 1);
                        }
                    }
                } else {
                    todayFailed++;
                }
            }
        }

        List<DailyLoginStatDto> dailyStats = new ArrayList<>();
        for (int i = 6; i >= 0; i--) {
            LocalDate day = today.minusDays(i);
            List<AuditLog> dayLogs = logsByDate.getOrDefault(day, List.of());
            long daySuccess = dayLogs.stream().filter(l -> "SUCCESS".equalsIgnoreCase(l.getResult())).count();
            long dayFailed = dayLogs.stream().filter(l -> "FAILURE".equalsIgnoreCase(l.getResult())).count();
            long dayUnique = dayLogs.stream()
                .filter(l -> "SUCCESS".equalsIgnoreCase(l.getResult()) && l.getActorUser() != null)
                .map(l -> l.getActorUser().getId())
                .distinct()
                .count();

            dailyStats.add(DailyLoginStatDto.builder()
                .date(day.format(DATE_FMT))
                .totalLogins(dayLogs.size())
                .successfulLogins(daySuccess)
                .failedLogins(dayFailed)
                .uniqueUsers(dayUnique)
                .build());
        }

        long activeSessions = 0;
        if (sessionFamilyRepository != null) {
            try {
                activeSessions = sessionFamilyRepository.countByRevokedAtIsNullAndAbsoluteExpiresAtAfter(now);
            } catch (Exception ex) {
                log.debug("Không thể đếm phiên hoạt động: {}", ex.getMessage());
            }
        }

        return LoginStatsResponse.builder()
            .todayLogins(todayTotal)
            .todaySuccessfulLogins(todaySuccess)
            .todayFailedLogins(todayFailed)
            .todayUniqueUsers(todayUserIds.size())
            .activeSessionsCount(activeSessions)
            .dailyStats(dailyStats)
            .roleBreakdown(roleCounts)
            .build();
    }

    private String sanitizeIp(String ip) {
        if (ip == null || ip.isBlank()) return null;
        String clean = ip.trim();
        if (clean.contains(",")) {
            clean = clean.split(",")[0].trim();
        }
        if ("0:0:0:0:0:0:0:1".equals(clean) || "::1".equals(clean)) {
            return "127.0.0.1";
        }
        return clean;
    }

    private AuditLogResponse mapToResponse(AuditLog entity) {
        User actor = entity.getActorUser();
        String actorName = "SYSTEM";
        String actorEmail = null;
        String actorRole = null;

        if (actor != null) {
            actorName = actor.getFullName();
            actorEmail = actor.getEmail();
            actorRole = actor.getRole() != null ? actor.getRole().name() : null;
        } else if (entity.getMetadata() != null && entity.getMetadata().containsKey("attemptedEmail")) {
            actorEmail = String.valueOf(entity.getMetadata().get("attemptedEmail"));
            actorName = actorEmail;
        }

        return AuditLogResponse.builder()
            .id(entity.getId())
            .actorUserId(actor != null ? actor.getId() : null)
            .actorName(actorName)
            .actorEmail(actorEmail)
            .actorRole(actorRole)
            .action(entity.getAction())
            .entityType(entity.getEntityType())
            .entityId(entity.getEntityId())
            .ipAddress(entity.getIpAddress())
            .userAgent(entity.getUserAgent())
            .result(entity.getResult())
            .changedFields(entity.getChangedFields())
            .metadata(entity.getMetadata() != null ? entity.getMetadata() : Map.of())
            .createdAt(entity.getCreatedAt())
            .build();
    }
}
