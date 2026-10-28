package com.internlink.core.application.auth.impl;

import com.internlink.core.application.auth.PasswordManagementService;
import com.internlink.core.domain.auth.User;
import com.internlink.core.infrastructure.persistence.jpa.JpaAuthSessionFamilyRepository;
import com.internlink.core.infrastructure.persistence.jpa.JpaUserRepository;
import com.internlink.core.presentation.auth.dto.request.ChangePasswordRequest;
import com.internlink.core.shared.exception.BadRequestException;
import com.internlink.core.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * Đảm nhiệm duy nhất 1 nhiệm vụ: Xử lý quy trình đổi mật khẩu cho người dùng hợp lệ.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class PasswordManagementServiceImpl implements PasswordManagementService {

    private final JpaUserRepository userRepository;
    private final JpaAuthSessionFamilyRepository sessionFamilyRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void changePassword(UUID userId, ChangePasswordRequest request) {
        com.internlink.core.application.auth.PasswordPolicy.validate(request.getNewPassword());
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new BadRequestException("Mật khẩu xác nhận không khớp với mật khẩu mới");
        }

        User user = userRepository.findByIdForUpdate(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPasswordHash())) {
            throw new BadRequestException("Mật khẩu hiện tại không chính xác");
        }

        if (passwordEncoder.matches(request.getNewPassword(), user.getPasswordHash())) {
            throw new BadRequestException("Mật khẩu mới không được trùng với mật khẩu hiện tại");
        }

        OffsetDateTime now = OffsetDateTime.now();
        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        user.setPasswordChangedAt(now);
        user.setMustChangePassword(false);
        userRepository.save(user);

        // Thu hồi toàn bộ các Refresh Session Family đang hoạt động để buộc đăng nhập lại
        int revokedFamilies = sessionFamilyRepository.revokeAllActiveFamiliesByUserId(
                userId, now, "PASSWORD_CHANGED");
        log.info("Người dùng [{}] đã đổi mật khẩu thành công. Đã thu hồi {} session family.", userId, revokedFamilies);
    }
}
