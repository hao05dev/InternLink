package com.internlink.core.infrastructure.integration.email;

import jakarta.annotation.PostConstruct;

import lombok.Getter;
import lombok.Setter;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import java.net.URI;
import java.util.Locale;
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
    private String deliveryMode = "DISABLED";
    private String redirectTo = "";
    private String eventWebhookSecret = "";
    private Set<String> allowedRecipients = Set.of();
    private int maxAttempts = 5;
    private int batchSize = 10;
    private String publicBaseUrl = "http://localhost:3000";

    @PostConstruct
    public void validate() {
        if (!enabled) return;
        deliveryMode = deliveryMode == null ? "DISABLED" : deliveryMode.strip().toUpperCase(Locale.ROOT);
        allowedRecipients = allowedRecipients == null
                ? Set.of()
                : allowedRecipients.stream()
                        .filter(value -> value != null && !value.isBlank())
                        .map(String::strip)
                        .collect(java.util.stream.Collectors.toUnmodifiableSet());
        if (!Set.of("DISABLED", "REDIRECT", "ALLOWLIST", "LIVE").contains(deliveryMode))
            throw new IllegalStateException(
                    "EMAIL_DELIVERY_MODE cần là DISABLED, REDIRECT, ALLOWLIST hoặc LIVE");
        if ("DISABLED".equals(deliveryMode)) return;
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
        if ("REDIRECT".equals(deliveryMode) && !validEmail(redirectTo))
            throw new IllegalStateException("EMAIL_REDIRECT_TO cần là email hợp lệ");
        if ("ALLOWLIST".equals(deliveryMode) && allowedRecipients.isEmpty())
            throw new IllegalStateException("EMAIL_ALLOWED_RECIPIENTS không được rỗng");
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
        if ("LIVE".equals(deliveryMode)) validateLiveDelivery();
    }

    public boolean accepts(String email) {
        if (!enabled || "DISABLED".equals(deliveryMode)) return false;
        if (!"ALLOWLIST".equals(deliveryMode)) return true;
        return allowedRecipients.stream().anyMatch(value -> value.equalsIgnoreCase(email));
    }

    public String routeRecipient(String intended) {
        return "REDIRECT".equals(deliveryMode) ? redirectTo : intended;
    }

    public String routeSubject(String intended, String subject) {
        return "REDIRECT".equals(deliveryMode)
                ? "[TEST → " + intended + "] " + subject
                : subject;
    }

    private void validateLiveDelivery() {
        URI uri = URI.create(publicBaseUrl);
        if (!"https".equalsIgnoreCase(uri.getScheme())
                || Set.of("localhost", "127.0.0.1", "::1").contains(uri.getHost()))
            throw new IllegalStateException("LIVE email yêu cầu APP_PUBLIC_URL HTTPS công khai");
        String domain = from.substring(from.lastIndexOf('@') + 1).toLowerCase(Locale.ROOT);
        if (Set.of("gmail.com", "yahoo.com", "outlook.com", "hotmail.com", "icloud.com")
                .contains(domain))
            throw new IllegalStateException("LIVE email không được dùng địa chỉ free-mail làm EMAIL_FROM");
        if (eventWebhookSecret == null || eventWebhookSecret.length() < 32)
            throw new IllegalStateException(
                    "LIVE email yêu cầu EMAIL_EVENT_WEBHOOK_SECRET có ít nhất 32 ký tự");
    }

    private boolean validEmail(String value) {
        return value != null && value.matches("^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$");
    }
}
