package com.internlink.core.infrastructure.integration.email;

public class EmailDeliveryException extends RuntimeException {
    private final String code;
    private final boolean retryable;
    private final boolean ambiguous;
    private final long retryAfterSeconds;

    public EmailDeliveryException(String code, boolean retryable, boolean ambiguous) {
        this(code, retryable, ambiguous, 0);
    }

    public EmailDeliveryException(
            String code, boolean retryable, boolean ambiguous, long retryAfterSeconds) {
        super(code);
        this.code = code;
        this.retryable = retryable;
        this.ambiguous = ambiguous;
        this.retryAfterSeconds = Math.max(0, Math.min(86400, retryAfterSeconds));
    }

    public long retryAfterSeconds() {
        return retryAfterSeconds;
    }

    public String code() {
        return code;
    }

    public boolean retryable() {
        return retryable;
    }

    public boolean ambiguous() {
        return ambiguous;
    }
}
