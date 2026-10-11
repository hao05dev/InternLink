package com.internlink.core.infrastructure.security;

import java.util.Date;

/**
 * Đảm nhiệm duy nhất 1 nhiệm vụ: Định nghĩa các thao tác thu hồi (revoke) và kiểm tra thu hồi token.
 */
public interface TokenRevocationService {

    /**
     * Thu hồi một token dựa trên ID duy nhất (JTI) và thời điểm hết hạn tự nhiên của token.
     *
     * @param jti        Mã định danh duy nhất của token (JWT ID)
     * @param expiryDate Thời điểm hết hạn của token
     */
    void revokeToken(String jti, Date expiryDate);

    /**
     * Kiểm tra xem token có nằm trong danh sách bị thu hồi hay không.
     *
     * @param jti Mã định danh duy nhất của token
     * @return true nếu token đã bị thu hồi
     */
    boolean isRevoked(String jti);
}
