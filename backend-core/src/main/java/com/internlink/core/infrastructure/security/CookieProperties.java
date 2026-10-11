package com.internlink.core.infrastructure.security;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

/**
 * Đảm nhiệm duy nhất 1 nhiệm vụ: Cung cấp cấu hình thuộc tính Cookie từ application.yml.
 */
@Getter
@Setter
@Configuration
@ConfigurationProperties(prefix = "internlink.cookie")
public class CookieProperties {

    /**
     * Cờ Secure: Chỉ gửi cookie qua kết nối HTTPS bảo mật.
     * Mặc định là false trên dev local, bật true trên production.
     */
    private boolean secure = false;

    /**
     * Cờ SameSite (Lax, Strict, None) nhằm kiểm soát việc gửi cookie qua các nguồn khác nhau.
     */
    private String sameSite = "Lax";

    /**
     * Đường dẫn hiệu lực của Cookie.
     */
    private String path = "/";

    /**
     * Domain hiệu lực của Cookie (tùy chọn, để null nếu dùng host-only).
     */
    private String domain;
}
