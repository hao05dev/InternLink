package com.internlink.core.infrastructure.persistence.jdbc;

import lombok.RequiredArgsConstructor;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
@RequiredArgsConstructor
public class NotificationEventRepository {
    private final JdbcTemplate jdbc;

    public boolean reserve(String key) {
        return jdbc.update(
                        "INSERT INTO notification_event_keys(event_key) VALUES(?) ON CONFLICT DO"
                                + " NOTHING",
                        key)
                > 0;
    }
}
