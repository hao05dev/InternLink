package com.internlink.core.application.auth.impl;

import com.internlink.core.domain.auth.User;
import com.internlink.core.infrastructure.persistence.jpa.JpaUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.OffsetDateTime;

/** Return failures so failed-attempt updates commit before the facade throws. */
@Service
@RequiredArgsConstructor
public class PasswordLoginService {
    private final JpaUserRepository users;
    private final PasswordEncoder passwords;
    private static final String DUMMY_HASH = "$2a$10$yn83n6F7678fdKd/Zdf4y.rcBqBFz3Yld9TTebnGizDaV9a9Al8V.";

    @Transactional
    public User authenticate(String email, String password) {
        User user = users.findByEmailForUpdate(email).orElse(null);
        boolean matches = passwords.matches(password, user == null ? DUMMY_HASH : user.getPasswordHash());
        if (user == null) return null;
        OffsetDateTime now = OffsetDateTime.now();
        if (!Boolean.TRUE.equals(user.getIsActive())
                || user.getLockedUntil() != null && user.getLockedUntil().isAfter(now)) return null;
        if (user.getLockedUntil() != null) {
            user.setFailedLoginAttempts(0);
            user.setLockedUntil(null);
        }
        if (!matches) {
            int attempts = (user.getFailedLoginAttempts() == null ? 0 : user.getFailedLoginAttempts()) + 1;
            user.setFailedLoginAttempts(attempts);
            if (attempts >= 5) user.setLockedUntil(now.plusMinutes(15));
            users.save(user);
            return null;
        }
        user.setFailedLoginAttempts(0);
        user.setLockedUntil(null);
        user.setLastLoginAt(now);
        return users.save(user);
    }
}
