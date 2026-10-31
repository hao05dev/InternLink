package com.internlink.core.shared.exception;

import com.internlink.core.shared.api.ApiResponse;
import com.internlink.core.shared.error.ErrorCode;
import org.hibernate.exception.ConstraintViolationException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.core.MethodParameter;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.validation.BeanPropertyBindingResult;
import org.springframework.validation.FieldError;
import org.springframework.validation.ObjectError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.multipart.MaxUploadSizeExceededException;

import java.sql.SQLException;
import java.util.Map;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

class GlobalExceptionHandlerTest {

    private GlobalExceptionHandler handler;

    @BeforeEach
    void setUp() {
        handler = new GlobalExceptionHandler();
    }

    @Test
    void handleGenericException_ShouldReturn500WithTraceId() {
        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/v1/test");
        Exception ex = new RuntimeException("Unexpected internal failure");

        ResponseEntity<ApiResponse<Void>> response = handler.handleGenericException(ex, request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.INTERNAL_SERVER_ERROR);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getErrorCode()).isEqualTo(ErrorCode.INTERNAL_SERVER_ERROR.getCode());
        assertThat(response.getBody().getMessage()).contains("mã tham chiếu:");
    }

    @Test
    void handleValidationExceptions_WithFieldErrorAndObjectError_ShouldNotThrowClassCastException() {
        BeanPropertyBindingResult bindingResult = new BeanPropertyBindingResult(new Object(), "testObject");
        bindingResult.addError(new FieldError("testObject", "username", "Tên đăng nhập không được để trống"));
        bindingResult.addError(new ObjectError("testObject", "Mật khẩu xác nhận không khớp"));

        MethodArgumentNotValidException ex = new MethodArgumentNotValidException(null, bindingResult);

        ResponseEntity<ApiResponse<Map<String, String>>> response = handler.handleValidationExceptions(ex);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(response.getBody()).isNotNull();
        Map<String, String> data = response.getBody().getData();
        assertThat(data).containsEntry("username", "Tên đăng nhập không được để trống");
        assertThat(data).containsEntry("testObject", "Mật khẩu xác nhận không khớp");
    }

    @Test
    void handleTypeMismatch_ShouldReturn400() {
        MethodArgumentTypeMismatchException ex = new MethodArgumentTypeMismatchException(
                "invalid-uuid", UUID.class, "studentId", null, null);

        ResponseEntity<ApiResponse<Void>> response = handler.handleTypeMismatch(ex);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getMessage()).contains("studentId");
    }

    @Test
    void handleMissingParam_ShouldReturn400() {
        MissingServletRequestParameterException ex = new MissingServletRequestParameterException("termId", "UUID");

        ResponseEntity<ApiResponse<Void>> response = handler.handleMissingParam(ex);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getMessage()).contains("termId");
    }

    @Test
    void handleMaxUploadSize_ShouldReturn413() {
        MaxUploadSizeExceededException ex = new MaxUploadSizeExceededException(10485760);

        ResponseEntity<ApiResponse<Void>> response = handler.handleMaxUploadSize(ex);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.PAYLOAD_TOO_LARGE);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getErrorCode()).isEqualTo(ErrorCode.DOCUMENT_TOO_LARGE.getCode());
    }

    @Test
    void handleDataIntegrity_WithKnownJobApplicationConstraint_ShouldReturnAlreadyApplied() {
        SQLException sqlEx = new SQLException("duplicate key value violates unique constraint \"uq_job_applications_job_student\"");
        ConstraintViolationException cve = new ConstraintViolationException(
                "could not execute statement", sqlEx, "uq_job_applications_job_student");
        DataIntegrityViolationException ex = new DataIntegrityViolationException("Conflict", cve);

        ResponseEntity<ApiResponse<Void>> response = handler.handleDataIntegrity(ex);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CONFLICT);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getErrorCode()).isEqualTo(ErrorCode.ALREADY_APPLIED.getCode());
        assertThat(response.getBody().getMessage()).contains("Bạn đã nộp hồ sơ");
    }

    @Test
    void handleDataIntegrity_WithKnownPlacementConstraint_ShouldReturnLivePlacementConflict() {
        SQLException sqlEx = new SQLException("duplicate key value violates unique constraint \"uq_placement_student_term_live\"");
        ConstraintViolationException cve = new ConstraintViolationException(
                "could not execute statement", sqlEx, "uq_placement_student_term_live");
        DataIntegrityViolationException ex = new DataIntegrityViolationException("Conflict", cve);

        ResponseEntity<ApiResponse<Void>> response = handler.handleDataIntegrity(ex);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CONFLICT);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getMessage()).contains("Sinh viên đã có một vị trí thực tập đang hoạt động");
    }
}
