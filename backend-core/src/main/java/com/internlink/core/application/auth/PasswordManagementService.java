package com.internlink.core.application.auth;

import com.internlink.core.presentation.auth.dto.request.ChangePasswordRequest;

import java.util.UUID;

public interface PasswordManagementService {

    /**
     * Thay đổi mật khẩu người dùng đang đăng nhập.
     *
     * @param userId  ID người dùng
     * @param request DTO chứa mật khẩu hiện tại và mật khẩu mới
     */
    void changePassword(UUID userId, ChangePasswordRequest request);
}
