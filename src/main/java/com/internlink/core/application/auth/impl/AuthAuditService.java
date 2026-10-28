package com.internlink.core.application.auth.impl;

import com.internlink.core.application.system.AuditLogService;
import com.internlink.core.infrastructure.security.ClientIpResolver;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthAuditService {
    private final AuditLogService audit;
    private final ClientIpResolver clientIps;
    public void record(UUID userId, String action, String result, HttpServletRequest request) {
        try {
            audit.logAction(userId, action, "USER", userId, result, Map.of(),
                    clientIps.resolve(request), request == null ? null : request.getHeader("User-Agent"), Map.of());
        } catch (Exception ex) {
            log.warn("Không thể ghi audit xác thực: {}", ex.getClass().getSimpleName());
        }
    }
}
