package com.internlink.core.shared.api;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.internlink.core.shared.error.ErrorCode;
import lombok.*;
import java.time.OffsetDateTime;

/**
 * Lớp phản hồi bao gói chuẩn RESTful API cho toàn bộ hệ thống InternLink.
 * Hỗ trợ error_code định dạng snake_case đồng bộ với Frontend và AI Service.
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiResponse<T> {

    @Builder.Default
    private boolean success = true;

    @JsonProperty("error_code")
    private String errorCode;

    private String message;

    private T data;

    @Builder.Default
    @JsonProperty("timestamp")
    private OffsetDateTime timestamp = OffsetDateTime.now();

    public static <T> ApiResponse<T> ok(T data) {
        return ApiResponse.<T>builder()
                .success(true)
                .data(data)
                .timestamp(OffsetDateTime.now())
                .build();
    }

    public static <T> ApiResponse<T> ok(String message, T data) {
        return ApiResponse.<T>builder()
                .success(true)
                .message(message)
                .data(data)
                .timestamp(OffsetDateTime.now())
                .build();
    }

    public static <T> ApiResponse<T> success(T data) {
        return ok(data);
    }

    public static <T> ApiResponse<T> success(String message, T data) {
        return ok(message, data);
    }

    public static <T> ApiResponse<T> success(String message) {
        return ok(message, null);
    }

    public static <T> ApiResponse<T> error(String message) {
        return ApiResponse.<T>builder()
                .success(false)
                .errorCode(ErrorCode.INTERNAL_SERVER_ERROR.getCode())
                .message(message)
                .timestamp(OffsetDateTime.now())
                .build();
    }

    public static <T> ApiResponse<T> error(ErrorCode errorCode) {
        return ApiResponse.<T>builder()
                .success(false)
                .errorCode(errorCode.getCode())
                .message(errorCode.getDefaultMessage())
                .timestamp(OffsetDateTime.now())
                .build();
    }

    public static <T> ApiResponse<T> error(ErrorCode errorCode, String customMessage) {
        return ApiResponse.<T>builder()
                .success(false)
                .errorCode(errorCode.getCode())
                .message(customMessage != null && !customMessage.isBlank() ? customMessage : errorCode.getDefaultMessage())
                .timestamp(OffsetDateTime.now())
                .build();
    }

    public static <T> ApiResponse<T> error(String errorCode, String message) {
        return ApiResponse.<T>builder()
                .success(false)
                .errorCode(errorCode)
                .message(message)
                .timestamp(OffsetDateTime.now())
                .build();
    }
}
