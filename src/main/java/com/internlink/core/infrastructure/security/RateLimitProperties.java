package com.internlink.core.infrastructure.security;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

/**
 * Đảm nhiệm duy nhất 1 nhiệm vụ: Cung cấp cấu hình hạn mức Rate Limit từ application.yml.
 */
@Getter
@Setter
@Configuration
@ConfigurationProperties(prefix = "internlink.rate-limit")
public class RateLimitProperties {

    /**
     * Bật / tắt bộ lọc Rate Limiting.
     */
    private boolean enabled = true;

    /**
     * Số lượt request tối đa cho đăng nhập (/api/v1/auth/login) trong 1 phút.
     */
    private int loginCapacity = 5;

    /**
     * Số lượt request tối đa cho upload tài liệu (/api/v1/documents/uploads) trong 1 phút.
     */
    private int uploadCapacity = 15;

    /**
     * Số lượt request tối đa cho AI service (/api/v1/ai-matching/**, /api/v1/ai-workspace/**) trong 1 phút.
     */
    private int aiCapacity = 20;

    /**
     * Số lượt request chung cho các endpoint API khác trong 1 phút.
     */
    private int defaultCapacity = 120;
}
