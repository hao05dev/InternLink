package com.internlink.core.application.auth;

import com.internlink.core.infrastructure.security.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class RecoveryRequestLimiter {
    private final RateLimiterService limits;
    private final RateLimitProperties properties;
    private final TokenCryptoUtils crypto;
    public boolean allow(String email) {
        return !properties.isEnabled() || limits.tryConsume("recovery-email:" + crypto.hashToken(email),
                RateLimiterService.LimitCategory.RECOVERY).isConsumed();
    }
}
