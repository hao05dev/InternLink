package com.internlink.core.shared.error;

import lombok.Getter;

/**
 * Exception miền nghiệp vụ cơ sở mang mã lỗi tập trung ErrorCode.
 */
@Getter
public class AppException extends RuntimeException {

    private final ErrorCode errorCode;

    public AppException(ErrorCode errorCode) {
        super(errorCode.getDefaultMessage());
        this.errorCode = errorCode;
    }

    public AppException(ErrorCode errorCode, String customMessage) {
        super(customMessage != null && !customMessage.isBlank() ? customMessage : errorCode.getDefaultMessage());
        this.errorCode = errorCode;
    }
}
