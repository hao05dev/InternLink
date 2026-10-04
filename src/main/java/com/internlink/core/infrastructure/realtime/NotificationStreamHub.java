package com.internlink.core.infrastructure.realtime;

import com.internlink.core.application.system.NotificationService;
import com.internlink.core.application.system.notification.NotificationChanged;
import com.internlink.core.infrastructure.persistence.jpa.JpaUserRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.*;
import java.util.concurrent.*;

@Component
@RequiredArgsConstructor
@ConditionalOnProperty(
        name = "notifications.realtime-enabled",
        havingValue = "true",
        matchIfMissing = true)
public class NotificationStreamHub {
    private final NotificationService notifications;
    private final JpaUserRepository users;
    private final Map<UUID, Set<SseEmitter>> connections = new ConcurrentHashMap<>();

    public synchronized SseEmitter open(UUID id) {
        var group = connections.computeIfAbsent(id, key -> ConcurrentHashMap.newKeySet());
        if (group.size() >= 5)
            throw new com.internlink.core.shared.exception.BadRequestException(
                    "Tối đa 5 kết nối thông báo mỗi tài khoản");
        var emitter = new SseEmitter(120000L);
        group.add(emitter);
        Runnable remove =
                () -> {
                    group.remove(emitter);
                    connections.computeIfPresent(
                            id,
                            (key, current) ->
                                    current == group && current.isEmpty() ? null : current);
                };
        emitter.onCompletion(remove);
        emitter.onTimeout(remove);
        emitter.onError(error -> remove.run());
        send(id, emitter, "connected");
        return emitter;
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void changed(NotificationChanged event) {
        sendAll(event.userId(), "notifications");
    }

    @Scheduled(fixedDelay = 15000)
    public void heartbeat() {
        // Cross-instance catch-up is a refresh hint, not a replay of private notification bodies.
        for (UUID id : connections.keySet()) sendAll(id, "refresh");
    }

    private void sendAll(UUID id, String name) {
        var group = connections.get(id);
        if (group != null) for (var emitter : group) send(id, emitter, name);
    }

    private void send(UUID id, SseEmitter emitter, String name) {
        try {
            if (users.findById(id)
                    .filter(user -> Boolean.TRUE.equals(user.getIsActive()))
                    .isEmpty()) {
                emitter.complete();
                return;
            }
            emitter.send(
                    SseEmitter.event()
                            .name(name)
                            .data(
                                    Map.of(
                                            "unreadCount",
                                            notifications.countUnreadNotifications(id))));
        } catch (IOException | RuntimeException ex) {
            emitter.complete();
        }
    }
}
