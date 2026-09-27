package com.internlink.core.shared.security;

import com.internlink.core.shared.enums.UserRole;
import com.internlink.core.shared.exception.ForbiddenException;
import com.internlink.core.infrastructure.security.CustomUserDetail;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.util.UUID;

/**
 * SecurityGuard — kiểm tra phân quyền theo từng thực thể hồ sơ (Resource-level Authorization).
 *
 * <p>Dùng để chống lỗ hổng IDOR (Insecure Direct Object Reference):
 * người dùng chỉ được thao tác trên dữ liệu thuộc quyền của họ,
 * không phụ thuộc vào việc họ biết UUID của thực thể hay không.</p>
 *
 * <p>Cách dùng trong Service:</p>
 * <pre>{@code
 *   securityGuard.requireSelf(currentUserId, targetOwnerUserId, "Offer");
 *   securityGuard.requireSelfOrAdmin(currentUserId, targetOwnerUserId);
 * }</pre>
 */
@Component
public class SecurityGuard {

    /**
     * Lấy thông tin người dùng đang đăng nhập từ Spring Security Context.
     *
     * @return CustomUserDetail của người dùng hiện tại
     * @throws ForbiddenException nếu chưa đăng nhập hoặc token không hợp lệ
     */
    public CustomUserDetail currentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()
                || !(authentication.getPrincipal() instanceof CustomUserDetail)) {
            throw new ForbiddenException("Phiên đăng nhập không hợp lệ hoặc đã hết hạn");
        }
        return (CustomUserDetail) authentication.getPrincipal();
    }

    /**
     * Yêu cầu người dùng hiện tại phải là chính chủ của thực thể (chống IDOR thuần túy).
     *
     * @param currentUserId  ID người đang thao tác (lấy từ token JWT)
     * @param ownerUserId    ID chủ sở hữu thực thể cần kiểm tra
     * @param resourceName   Tên thực thể để đưa vào thông báo lỗi
     * @throws ForbiddenException nếu không phải chính chủ
     */
    public void requireSelf(UUID currentUserId, UUID ownerUserId, String resourceName) {
        if (!currentUserId.equals(ownerUserId)) {
            throw new ForbiddenException(
                "Bạn không có quyền thao tác trên " + resourceName + " này"
            );
        }
    }

    /**
     * Yêu cầu người dùng hiện tại phải là chính chủ HOẶC có vai trò Admin/Faculty Admin.
     *
     * @param currentUserId ID người đang thao tác
     * @param ownerUserId   ID chủ sở hữu thực thể
     * @throws ForbiddenException nếu không phải chính chủ và không phải Admin
     */
    public void requireSelfOrAdmin(UUID currentUserId, UUID ownerUserId) {
        CustomUserDetail user = currentUser();
        boolean isAdmin = user.getRole() == UserRole.ADMIN
            || user.getRole() == UserRole.FACULTY_ADMIN;
        if (!currentUserId.equals(ownerUserId) && !isAdmin) {
            throw new ForbiddenException("Bạn không có quyền truy cập tài nguyên này");
        }
    }

    /**
     * Kiểm tra người dùng có phải chính chủ HOẶC Admin (trả boolean, không throw).
     * Dùng để quyết định có ẩn/hiện trường nhạy cảm (như URL file) trong response.
     *
     * @param currentUserId ID người đang thao tác
     * @param ownerUserId   ID chủ sở hữu thực thể
     * @return true nếu là chính chủ hoặc là Admin/Faculty Admin
     */
    public boolean isSelfOrAdmin(UUID currentUserId, UUID ownerUserId) {
        CustomUserDetail user = currentUser();
        boolean isAdmin = user.getRole() == UserRole.ADMIN
            || user.getRole() == UserRole.FACULTY_ADMIN;
        return currentUserId.equals(ownerUserId) || isAdmin;
    }

    /**
     * Yêu cầu người dùng hiện tại có vai trò trong danh sách cho phép.
     *
     * @param allowedRoles danh sách vai trò được phép
     * @throws ForbiddenException nếu không có vai trò phù hợp
     */
    public void requireRole(UserRole... allowedRoles) {
        CustomUserDetail user = currentUser();
        for (UserRole role : allowedRoles) {
            if (user.getRole() == role) return;
        }
        throw new ForbiddenException("Bạn không có quyền thực hiện thao tác này");
    }

    /**
     * Kiểm tra người dùng hiện tại có quyền xem tài liệu dựa trên:
     * - Là chủ sở hữu tài liệu (owner), HOẶC
     * - Là Admin / Faculty Admin (có quyền xem mọi tài liệu).
     *
     * <p>Giảng viên phụ trách và mentor doanh nghiệp cần kiểm tra riêng tại lớp service
     * vì phụ thuộc vào placement cụ thể.</p>
     *
     * @param currentUserId ID người đang thao tác
     * @param ownerUserId   ID chủ sở hữu tài liệu
     * @throws ForbiddenException nếu không có quyền
     */
    public void requireDocumentReadAccess(UUID currentUserId, UUID ownerUserId) {
        CustomUserDetail user = currentUser();
        boolean isAdmin = user.getRole() == UserRole.ADMIN
            || user.getRole() == UserRole.FACULTY_ADMIN;
        boolean isOwner = currentUserId.equals(ownerUserId);
        if (!isOwner && !isAdmin) {
            throw new ForbiddenException("Bạn không có quyền xem tài liệu này");
        }
    }
}
