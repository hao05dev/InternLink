package com.internlink.core.application.auth;

import com.internlink.core.domain.auth.User;
import com.internlink.core.infrastructure.persistence.jpa.JpaUserRepository;
import com.internlink.core.infrastructure.persistence.jpa.JpaAuthSessionFamilyRepository;
import com.internlink.core.presentation.auth.dto.request.AdminUserRequests.*;
import com.internlink.core.presentation.auth.dto.response.*;
import com.internlink.core.shared.exception.*;
import com.internlink.core.shared.enums.UserRole;
import com.internlink.core.shared.security.SecurityGuard;
import com.internlink.core.application.system.AuditLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.*;
import java.time.OffsetDateTime;

@Service
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminUserManagementService {
    private final JpaUserRepository users;
    private final JpaAuthSessionFamilyRepository sessions;
    private final UserOrganizationPolicy organizations;
    private final PasswordEncoder passwords;
    private final SecurityGuard guard;
    private final AuditLogService audit;

    @Transactional(readOnly = true)
    public List<UserSummaryDto> list() {
        return users.findAll().stream().map(UserManagementMapper::summary).toList();
    }
    @Transactional(readOnly = true)
    public UserDetailDto get(UUID id) { return UserManagementMapper.detail(find(id)); }

    @Transactional
    public UserSummaryDto create(CreateUserRequest request) {
        PasswordPolicy.validate(request.temporaryPassword());
        String email = request.email().trim().toLowerCase(Locale.ROOT);
        if (users.existsByEmail(email)) throw new BadRequestException("Email đã có tài khoản");
        User user = User.builder().email(email).fullName(request.fullName().trim())
                .passwordHash(passwords.encode(request.temporaryPassword()))
                .role(request.role()).mustChangePassword(true).isActive(true).build();
        organizations.assign(user, request.role(), request.departmentId(), request.companyId());
        user = users.saveAndFlush(user);
        record(user, "CREATE_USER");
        return UserManagementMapper.summary(user);
    }

    @Transactional
    public UserDetailDto update(UUID id, UpdateUserRequest request) {
        User user = find(id);
        if (id.equals(guard.currentUser().getId()) && (request.role() != UserRole.ADMIN || !request.isActive()))
            throw new BadRequestException("Không thể tự khóa hoặc bỏ quyền ADMIN của chính mình");
        user.setFullName(request.fullName().trim());
        user.setRole(request.role());
        user.setIsActive(request.isActive());
        organizations.assign(user, request.role(), request.departmentId(), request.companyId());
        invalidateSessions(user, "ACCOUNT_UPDATED");
        record(user, "UPDATE_USER");
        return UserManagementMapper.detail(users.save(user));
    }

    @Transactional
    public UserDetailDto changeEmail(UUID id, ChangeEmailRequest request) {
        User user = find(id);
        String email = request.newEmail().trim().toLowerCase(Locale.ROOT);
        if (!email.equals(user.getEmail()) && users.existsByEmail(email))
            throw new BadRequestException("Email đã có tài khoản");
        if (!email.equals(user.getEmail())) {
            user.setEmail(email);
            user.setGoogleSubject(null);
            user.setAuthProvider("LOCAL");
            user.setEmailVerifiedAt(null);
            invalidateSessions(user, "EMAIL_CHANGED");
        }
        record(user, "CHANGE_USER_EMAIL");
        return UserManagementMapper.detail(users.saveAndFlush(user));
    }

    @Transactional
    public void delete(UUID id) {
        if (id.equals(guard.currentUser().getId())) throw new BadRequestException("Không thể tự xóa tài khoản");
        User user = find(id);
        record(user, "DELETE_USER");
        users.delete(user);
    }

    private User find(UUID id) {
        return users.findById(id).orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
    }
    private void invalidateSessions(User user, String reason) {
        OffsetDateTime now = OffsetDateTime.now();
        user.setPasswordChangedAt(now);
        sessions.revokeAllActiveFamiliesByUserId(user.getId(), now, reason);
    }
    private void record(User user, String action) {
        audit.logAction(guard.currentUser().getId(), action, "User", user.getId(),
                "SUCCESS", Map.of("role", user.getRole().name()), null);
    }
}
