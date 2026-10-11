package com.internlink.core.infrastructure.security;

import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Đảm nhiệm duy nhất 1 nhiệm vụ: Lưu trữ và tự động dọn dẹp danh sách Token bị thu hồi trong bộ nhớ RAM.
 */
@Slf4j
@Service
public class InMemoryTokenBlacklistService implements TokenRevocationService {

    // Key: jti (JWT ID), Value: Expiration Epoch Milliseconds
    private final Map<String, Long> revokedTokens = new ConcurrentHashMap<>();

    @Override
    public void revokeToken(String jti, Date expiryDate) {
        if (jti == null || jti.isBlank()) {
            return;
        }

        long expiryMillis = expiryDate != null ? expiryDate.getTime() : System.currentTimeMillis() + 86400000L;
        revokedTokens.put(jti, expiryMillis);
        log.info("Token với JTI [{}] đã được đưa vào danh sách thu hồi (Blacklist) đến {}", jti, new Date(expiryMillis));
    }

    @Override
    public boolean isRevoked(String jti) {
        if (jti == null || jti.isBlank()) {
            return false;
        }

        Long expiryMillis = revokedTokens.get(jti);
        if (expiryMillis == null) {
            return false;
        }

        // Nếu token đã hết hạn tự nhiên -> tự động loại khỏi blacklist để tiết kiệm RAM
        if (System.currentTimeMillis() > expiryMillis) {
            revokedTokens.remove(jti);
            return false;
        }

        return true;
    }

    /**
     * Tác vụ định kỳ mỗi 10 phút: dọn dẹp các token đã quá hạn khỏi blacklist.
     */
    @Scheduled(fixedRate = 600000)
    public void purgeExpiredTokens() {
        long now = System.currentTimeMillis();
        int initialSize = revokedTokens.size();
        revokedTokens.entrySet().removeIf(entry -> entry.getValue() < now);
        int purgedCount = initialSize - revokedTokens.size();
        if (purgedCount > 0) {
            log.debug("Đã dọn dẹp {} token hết hạn khỏi Blacklist", purgedCount);
        }
    }
}
