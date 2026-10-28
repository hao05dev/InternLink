package com.internlink.core.infrastructure.security;

import jakarta.servlet.http.HttpServletResponse;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

public final class AuthCookieWriter {
    private AuthCookieWriter() {}
    public static void add(HttpServletResponse response, String name, String value) {
        if (TransactionSynchronizationManager.isSynchronizationActive()) {
            TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                @Override public void afterCommit() { response.addHeader(name, value); }
            });
        } else {
            response.addHeader(name, value);
        }
    }
}
