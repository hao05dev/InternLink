package com.internlink.core.infrastructure.security;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.time.OffsetDateTime;
import java.util.Date;

/**
 * Đảm nhiệm duy nhất 1 nhiệm vụ: Xác thực trạng thái an toàn tài khoản người dùng
 * (tài khoản còn kích hoạt, mật khẩu có bị đổi sau khi token được phát hành hay không).
 */
@Slf4j
@Component
public class UserSecurityStateValidator {
    public boolean isTokenValidForUser(CustomUserDetail user, Date issuedAt, String securityStamp) {
        if (user == null || !user.isEnabled() || !user.isAccountNonLocked()) return false;
        if (securityStamp == null) return isTokenValidForUser(user, issuedAt);
        String expected = user.getPasswordChangedAt() == null ? "initial"
                : user.getPasswordChangedAt().toInstant().toString();
        return expected.equals(securityStamp);
    }

    /**
     * Kiểm tra tính hợp lệ của token đối với trạng thái người dùng hiện tại.
     *
     * @param user     Thông tin chi tiết người dùng
     * @param issuedAt Thời điểm token được phát hành (iat)
     * @return true nếu token hợp lệ với trạng thái người dùng
     */
    public boolean isTokenValidForUser(CustomUserDetail user, Date issuedAt) {
        if (user == null || !user.isEnabled() || !user.isAccountNonLocked()) {
            return false;
        }

        OffsetDateTime passwordChangedAt = user.getPasswordChangedAt();
        if (passwordChangedAt != null && issuedAt != null) {
            long issuedAtMillis = issuedAt.getTime();
            long passwordChangedAtMillis = passwordChangedAt.toInstant().toEpochMilli();

            if (issuedAtMillis < passwordChangedAtMillis) {
                log.warn("Từ chối token của user [{}]: mật khẩu đã được đổi vào lúc {} sau thời điểm cấp token {}",
                        user.getId(), passwordChangedAt, issuedAt);
                return false;
            }
        }

        return true;
    }
}
