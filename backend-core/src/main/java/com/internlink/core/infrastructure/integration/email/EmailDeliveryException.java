package com.internlink.core.infrastructure.integration.email;
public class EmailDeliveryException extends RuntimeException {
    private final String code;
    private final boolean retryable;
    private final boolean ambiguous;
    public EmailDeliveryException(String code, boolean retryable, boolean ambiguous) {
        super(code); this.code=code; this.retryable=retryable; this.ambiguous=ambiguous;
    }
    public String code() { return code; }
    public boolean retryable() { return retryable; }
    public boolean ambiguous() { return ambiguous; }
}
