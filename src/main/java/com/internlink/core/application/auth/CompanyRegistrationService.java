package com.internlink.core.application.auth;

import com.internlink.core.presentation.auth.dto.request.RegisterCompanyRequest;
import com.internlink.core.presentation.auth.dto.response.AuthResponse;
import jakarta.servlet.http.HttpServletResponse;

/**
 * Đảm nhiệm duy nhất 1 nhiệm vụ: Thẩm định và tiếp nhận đăng ký tài khoản Doanh nghiệp mới.
 */
public interface CompanyRegistrationService {
    AuthResponse registerCompany(RegisterCompanyRequest request, HttpServletResponse response);
}
