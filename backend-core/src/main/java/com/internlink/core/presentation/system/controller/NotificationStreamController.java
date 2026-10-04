package com.internlink.core.presentation.system.controller;

import com.internlink.core.infrastructure.realtime.NotificationStreamHub;
import com.internlink.core.infrastructure.security.CustomUserDetail;

import lombok.RequiredArgsConstructor;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

@RestController
@RequiredArgsConstructor
@ConditionalOnProperty(
        name = "notifications.realtime-enabled",
        havingValue = "true",
        matchIfMissing = true)
@PreAuthorize("isAuthenticated()")
public class NotificationStreamController {
    private final NotificationStreamHub hub;

    @GetMapping(
            value = "/api/v1/notifications/stream",
            produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public ResponseEntity<SseEmitter> stream(@AuthenticationPrincipal CustomUserDetail user) {
        return ResponseEntity.ok()
                .cacheControl(CacheControl.noStore())
                .header("X-Accel-Buffering", "no")
                .body(hub.open(user.getId()));
    }
}
