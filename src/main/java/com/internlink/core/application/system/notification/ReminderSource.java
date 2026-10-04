package com.internlink.core.application.system.notification;

import java.time.OffsetDateTime;
import java.util.List;

public interface ReminderSource {
    List<ReminderCandidate> pending(OffsetDateTime now);

    boolean stillPending(ReminderCandidate candidate, OffsetDateTime now);

    boolean reserve(String key);
}
