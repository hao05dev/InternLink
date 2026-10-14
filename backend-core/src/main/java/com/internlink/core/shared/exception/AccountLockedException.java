package com.internlink.core.shared.exception;

import lombok.Getter;

@Getter
public class AccountLockedException extends RuntimeException {

    private final long secondsRemaining;

    public AccountLockedException(String message, long secondsRemaining) {
        super(message);
        this.secondsRemaining = secondsRemaining;
    }

    public AccountLockedException(String message) {
        super(message);
        this.secondsRemaining = 0;
    }
}
