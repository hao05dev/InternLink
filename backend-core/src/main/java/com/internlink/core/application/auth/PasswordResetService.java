package com.internlink.core.application.auth;

import com.internlink.core.presentation.auth.dto.request.ForgotPasswordRequest;
import com.internlink.core.presentation.auth.dto.request.ResetPasswordRequest;

public interface PasswordResetService {

    /**
     * Tiếp nhận yêu cầu quên mật khẩu, sinh mã xác thực và gửi qua email.
     *
     * @param request DTO chứa email cần khôi phục
     */
    void forgotPassword(ForgotPasswordRequest request);

    /**
     * Xác thực token và tiến hành đặt lại mật khẩu mới.
     *
     * @param request DTO chứa mã token và mật khẩu mới
     */
    void resetPassword(ResetPasswordRequest request);
}
