package com.internlink.core.application.auth;

import com.internlink.core.domain.auth.PasswordResetToken;
import com.internlink.core.domain.auth.User;
import com.internlink.core.infrastructure.integration.email.EmailProperties;
import com.internlink.core.infrastructure.persistence.jpa.JpaPasswordResetTokenRepository;
import com.internlink.core.infrastructure.security.TokenCryptoUtils;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;

/** Issues a one-time password setup link without exposing a temporary password. */
@Service
@RequiredArgsConstructor
public class AccountActivationTokenService {
    private static final long ACTIVATION_TTL_HOURS = 24;

    private final JpaPasswordResetTokenRepository tokens;
    private final TokenCryptoUtils crypto;
    private final EmailProperties email;

    public String issue(User user) {
        String rawToken = crypto.generateSecureRandomToken();
        tokens.save(
                PasswordResetToken.builder()
                        .user(user)
                        .tokenHash(crypto.hashToken(rawToken))
                        .expiresAt(OffsetDateTime.now().plusHours(ACTIVATION_TTL_HOURS))
                        .purpose("ACCOUNT_ACTIVATION")
                        .build());
        return email.getPublicBaseUrl() + "/reset-password?purpose=activation&token=" + rawToken;
    }

    public long ttlHours() {
        return ACTIVATION_TTL_HOURS;
    }
}
