package com.internlink.core.presentation.system.controller;
import com.internlink.core.infrastructure.integration.email.EmailProperties;
import com.internlink.core.shared.api.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController @RequestMapping("/api/v1/notifications/delivery-summary") @RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class EmailDeliveryStatusController {
    private final JdbcTemplate jdbc;
    private final EmailProperties settings;
    @GetMapping public ApiResponse<Map<String,Object>> summary() {
        Map<String,Long> counts=new LinkedHashMap<>();
        jdbc.query("SELECT status,COUNT(*) AS amount FROM email_outbox GROUP BY status", (org.springframework.jdbc.core.RowCallbackHandler)
            rs -> counts.put(rs.getString("status"),rs.getLong("amount")));
        return ApiResponse.success(Map.of("enabled",settings.isEnabled(),"provider",settings.getProvider(),"counts",counts));
    }
}
