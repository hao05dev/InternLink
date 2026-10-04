package com.internlink.core.infrastructure.integration.email;

import jakarta.annotation.PostConstruct;

import lombok.Getter;
import lombok.Setter;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import java.net.URI;
import java.util.Set;

@Getter
@Setter
@Component
@ConfigurationProperties("internlink.email")
public class EmailProperties {
    private boolean enabled = false;
    private String provider = "DISABLED";
    private String from = "";
    private String smtpUsername = "";
    private String smtpAppPassword = "";
    private int maxAttempts = 5;
    private int batchSize = 10;
    private String publicBaseUrl = "http://localhost:3000";

    @PostConstruct
    public void validate() {
        if (!enabled) return;
        if (!Set.of("GMAIL_SMTP", "GOOGLE_WORKSPACE").contains(provider))
            throw new IllegalStateException(
                    "EMAIL_PROVIDER cần là GMAIL_SMTP hoặc GOOGLE_WORKSPACE");
        if (from == null || !from.matches("^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$"))
            throw new IllegalStateException("EMAIL_FROM cần là địa chỉ email hợp lệ");
        if (maxAttempts < 1 || maxAttempts > 10)
            throw new IllegalStateException("email.max-attempts cần nằm trong khoảng 1–10");
        if (batchSize < 1 || batchSize > 50)
            throw new IllegalStateException("email.batch-size cần nằm trong khoảng 1–50");
        if ("GMAIL_SMTP".equals(provider)
                && (!from.equalsIgnoreCase(smtpUsername) || smtpAppPassword.isBlank()))
            throw new IllegalStateException(
                    "Cần Gmail username trùng EMAIL_FROM và mật khẩu ứng dụng");
        try {
            URI uri = URI.create(publicBaseUrl);
            if (!Set.of("https", "http").contains(uri.getScheme())
                    || uri.getHost() == null
                    || uri.getUserInfo() != null
                    || uri.getQuery() != null
                    || uri.getFragment() != null
                    || !(uri.getPath().isEmpty() || "/".equals(uri.getPath())))
                throw new IllegalArgumentException();
        } catch (RuntimeException ex) {
            throw new IllegalStateException("APP_PUBLIC_URL cần là origin HTTP/HTTPS của frontend");
        }
    }
}
