package com.internlink.core.presentation.auth.controller;

import com.internlink.core.application.system.AuditLogService;
import com.internlink.core.domain.auth.User;
import com.internlink.core.infrastructure.persistence.jpa.JpaCompanyRepository;
import com.internlink.core.infrastructure.persistence.jpa.JpaDepartmentRepository;
import com.internlink.core.infrastructure.persistence.jpa.JpaUserRepository;
import com.internlink.core.presentation.auth.dto.response.UserDetailDto;
import com.internlink.core.presentation.auth.dto.response.UserSummaryDto;
import com.internlink.core.shared.api.ApiResponse;
import com.internlink.core.shared.enums.UserRole;
import com.internlink.core.shared.exception.BadRequestException;
import com.internlink.core.shared.exception.ResourceNotFoundException;
import com.internlink.core.shared.security.SecurityGuard;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin/users")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminUserController {
    private final JpaUserRepository users;
    private final JpaDepartmentRepository departments;
    private final JpaCompanyRepository companies;
    private final PasswordEncoder passwords;
    private final AuditLogService audit;
    private final SecurityGuard securityGuard;

    public record CreateUserRequest(@NotBlank @Email String email, @NotBlank String fullName,
        @NotNull UserRole role, @NotBlank @Size(min = 8) String temporaryPassword,
        UUID departmentId, UUID companyId) {}
    public record UpdateUserRequest(@NotBlank String fullName, @NotNull UserRole role,
        @NotNull Boolean isActive, UUID departmentId, UUID companyId) {}
    public record ChangeEmailRequest(@NotBlank @Email String newEmail, String reason) {}

    @GetMapping
    @Transactional(readOnly = true)
    public ResponseEntity<ApiResponse<List<UserSummaryDto>>> list() {
        return ResponseEntity.ok(ApiResponse.success(users.findAll().stream().map(this::toDto).toList()));
    }

    @GetMapping("/{id}")
    @Transactional(readOnly = true)
    public ResponseEntity<ApiResponse<UserDetailDto>> getById(@PathVariable UUID id) {
        User user = users.findById(id).orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
        return ResponseEntity.ok(ApiResponse.success(toDetailDto(user)));
    }

    @PostMapping
    @Transactional
    public ResponseEntity<ApiResponse<UserSummaryDto>> create(@Valid @RequestBody CreateUserRequest request) {
        String email = request.email().trim().toLowerCase();
        if (users.existsByEmail(email)) throw new BadRequestException("Email đã có tài khoản");
        User user = User.builder().email(email).fullName(request.fullName().trim())
            .passwordHash(passwords.encode(request.temporaryPassword()))
            .role(request.role()).mustChangePassword(true).isActive(true).build();
        assignOrganization(user, request.role(), request.departmentId(), request.companyId());
        User saved = users.save(user);
        audit.logAction(securityGuard.currentUser().getId(), "CREATE_USER", "User", saved.getId(),
            "SUCCESS", Map.of("role", saved.getRole().name()), null);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(toDto(saved)));
    }

    @PutMapping("/{id}")
    @Transactional
    public ResponseEntity<ApiResponse<UserDetailDto>> update(@PathVariable UUID id,
        @Valid @RequestBody UpdateUserRequest request) {
        User user = users.findById(id).orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
        if (id.equals(securityGuard.currentUser().getId())
            && (request.role() != UserRole.ADMIN || !request.isActive()))
            throw new BadRequestException("Không thể tự khóa hoặc bỏ quyền ADMIN của chính mình");
        user.setFullName(request.fullName().trim());
        user.setRole(request.role());
        user.setIsActive(request.isActive());
        assignOrganization(user, request.role(), request.departmentId(), request.companyId());
        User saved = users.save(user);
        audit.logAction(securityGuard.currentUser().getId(), "UPDATE_USER", "User", id,
            "SUCCESS", Map.of("role", saved.getRole().name(), "isActive", saved.getIsActive()), null);
        return ResponseEntity.ok(ApiResponse.success(toDetailDto(saved)));
    }

    @PostMapping("/{id}/change-email")
    @Transactional
    public ResponseEntity<ApiResponse<UserDetailDto>> changeEmail(@PathVariable UUID id,
        @Valid @RequestBody ChangeEmailRequest request) {
        User user = users.findById(id).orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
        String newEmail = request.newEmail().trim().toLowerCase();
        if (users.existsByEmail(newEmail) && !newEmail.equalsIgnoreCase(user.getEmail())) {
            throw new BadRequestException("Địa chỉ email này đã được sử dụng bởi tài khoản khác.");
        }
        String oldEmail = user.getEmail();
        user.setEmail(newEmail);
        User saved = users.save(user);
        audit.logAction(securityGuard.currentUser().getId(), "CHANGE_USER_EMAIL", "User", id,
            "SUCCESS", Map.of("oldEmail", oldEmail, "newEmail", newEmail, "reason", request.reason() != null ? request.reason() : ""), null);
        return ResponseEntity.ok(ApiResponse.success("Đã đổi địa chỉ email thành công", toDetailDto(saved)));
    }

    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable UUID id) {
        if (id.equals(securityGuard.currentUser().getId())) {
            throw new BadRequestException("Không thể tự xóa tài khoản của chính mình.");
        }
        User user = users.findById(id).orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
        users.delete(user);
        audit.logAction(securityGuard.currentUser().getId(), "DELETE_USER", "User", id,
            "SUCCESS", Map.of("email", user.getEmail(), "role", user.getRole().name()), null);
        return ResponseEntity.ok(ApiResponse.success("Đã xóa người dùng thành công", null));
    }

    private void assignOrganization(User user, UserRole role, UUID departmentId, UUID companyId) {
        if (role == UserRole.FACULTY_ADMIN || role == UserRole.LECTURER || role == UserRole.STUDENT) {
            if (departmentId == null) throw new BadRequestException("Vai trò này cần khoa trực thuộc");
            user.setDepartment(departments.findById(departmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Department", "id", departmentId)));
            user.setCompany(null);
        } else if (role == UserRole.COMPANY_REP || role == UserRole.COMPANY_MENTOR) {
            if (companyId == null) throw new BadRequestException("Vai trò này cần doanh nghiệp trực thuộc");
            user.setCompany(companies.findById(companyId)
                .orElseThrow(() -> new ResourceNotFoundException("Company", "id", companyId)));
            user.setDepartment(null);
        } else if (role == UserRole.BLOG_MANAGER) {
            if (departmentId != null) {
                user.setDepartment(departments.findById(departmentId)
                    .orElseThrow(() -> new ResourceNotFoundException("Department", "id", departmentId)));
            } else {
                user.setDepartment(null);
            }
            user.setCompany(null);
        } else {
            user.setDepartment(null);
            user.setCompany(null);
        }
    }

    private UserSummaryDto toDto(User user) {
        return UserSummaryDto.builder().id(user.getId()).email(user.getEmail()).fullName(user.getFullName())
            .phoneNumber(user.getPhoneNumber()).role(user.getRole())
            .departmentId(user.getDepartment() == null ? null : user.getDepartment().getId())
            .companyId(user.getCompany() == null ? null : user.getCompany().getId())
            .mustChangePassword(user.getMustChangePassword()).isActive(user.getIsActive())
            .lastLoginAt(user.getLastLoginAt()).build();
    }

    private UserDetailDto toDetailDto(User user) {
        return UserDetailDto.builder()
            .id(user.getId())
            .email(user.getEmail())
            .fullName(user.getFullName())
            .phoneNumber(user.getPhoneNumber())
            .role(user.getRole())
            .departmentId(user.getDepartment() == null ? null : user.getDepartment().getId())
            .departmentName(user.getDepartment() == null ? null : user.getDepartment().getName())
            .companyId(user.getCompany() == null ? null : user.getCompany().getId())
            .companyName(user.getCompany() == null ? null : user.getCompany().getCompanyName())
            .mustChangePassword(user.getMustChangePassword())
            .lastLoginAt(user.getLastLoginAt())
            .isActive(user.getIsActive())
            .createdAt(user.getCreatedAt())
            .updatedAt(user.getUpdatedAt())
            .authProvider(user.getAuthProvider())
            .permissions(computePermissions(user.getRole()))
            .build();
    }

    private Map<String, String> computePermissions(UserRole role) {
        Map<String, String> map = new HashMap<>();
        if (role == null) return map;
        switch (role) {
            case ADMIN -> {
                map.put("MANAGE_USERS", "FULL_ACCESS");
                map.put("MANAGE_DEPARTMENTS", "FULL_ACCESS");
                map.put("MANAGE_TERMS", "FULL_ACCESS");
                map.put("MANAGE_COMPANIES", "FULL_ACCESS");
                map.put("MANAGE_CANDIDATES", "FULL_ACCESS");
                map.put("MANAGE_LETTERS", "FULL_ACCESS");
                map.put("MANAGE_TEMPLATES", "FULL_ACCESS");
                map.put("MANAGE_BLOG", "FULL_ACCESS");
                map.put("MANAGE_STORAGE", "FULL_ACCESS");
                map.put("MANAGE_SYSTEM", "FULL_ACCESS");
            }
            case FACULTY_ADMIN -> {
                map.put("MANAGE_USERS", "READ_ONLY");
                map.put("MANAGE_DEPARTMENTS", "READ_ONLY");
                map.put("MANAGE_TERMS", "FULL_ACCESS");
                map.put("MANAGE_COMPANIES", "READ_ONLY");
                map.put("MANAGE_CANDIDATES", "FULL_ACCESS");
                map.put("MANAGE_LETTERS", "FULL_ACCESS");
                map.put("MANAGE_TEMPLATES", "FULL_ACCESS");
                map.put("MANAGE_BLOG", "READ_ONLY");
                map.put("MANAGE_STORAGE", "NO_ACCESS");
                map.put("MANAGE_SYSTEM", "NO_ACCESS");
            }
            case LECTURER -> {
                map.put("MANAGE_USERS", "NO_ACCESS");
                map.put("MANAGE_DEPARTMENTS", "READ_ONLY");
                map.put("MANAGE_TERMS", "READ_ONLY");
                map.put("MANAGE_COMPANIES", "READ_ONLY");
                map.put("MANAGE_CANDIDATES", "FULL_ACCESS");
                map.put("MANAGE_LETTERS", "READ_ONLY");
                map.put("MANAGE_TEMPLATES", "READ_ONLY");
                map.put("MANAGE_BLOG", "NO_ACCESS");
                map.put("MANAGE_STORAGE", "NO_ACCESS");
                map.put("MANAGE_SYSTEM", "NO_ACCESS");
            }
            case COMPANY_REP, COMPANY_MENTOR -> {
                map.put("MANAGE_USERS", "NO_ACCESS");
                map.put("MANAGE_DEPARTMENTS", "NO_ACCESS");
                map.put("MANAGE_TERMS", "READ_ONLY");
                map.put("MANAGE_COMPANIES", role == UserRole.COMPANY_REP ? "FULL_ACCESS" : "READ_ONLY");
                map.put("MANAGE_CANDIDATES", "FULL_ACCESS");
                map.put("MANAGE_LETTERS", "NO_ACCESS");
                map.put("MANAGE_TEMPLATES", "READ_ONLY");
                map.put("MANAGE_BLOG", "NO_ACCESS");
                map.put("MANAGE_STORAGE", "NO_ACCESS");
                map.put("MANAGE_SYSTEM", "NO_ACCESS");
            }
            case BLOG_MANAGER -> {
                map.put("MANAGE_USERS", "NO_ACCESS");
                map.put("MANAGE_DEPARTMENTS", "READ_ONLY");
                map.put("MANAGE_TERMS", "READ_ONLY");
                map.put("MANAGE_COMPANIES", "READ_ONLY");
                map.put("MANAGE_CANDIDATES", "NO_ACCESS");
                map.put("MANAGE_LETTERS", "FULL_ACCESS");
                map.put("MANAGE_TEMPLATES", "READ_ONLY");
                map.put("MANAGE_BLOG", "FULL_ACCESS");
                map.put("MANAGE_STORAGE", "READ_ONLY");
                map.put("MANAGE_SYSTEM", "NO_ACCESS");
            }
            default -> {
                map.put("MANAGE_USERS", "NO_ACCESS");
                map.put("MANAGE_DEPARTMENTS", "NO_ACCESS");
                map.put("MANAGE_TERMS", "READ_ONLY");
                map.put("MANAGE_COMPANIES", "READ_ONLY");
                map.put("MANAGE_CANDIDATES", "NO_ACCESS");
                map.put("MANAGE_LETTERS", "READ_ONLY");
                map.put("MANAGE_TEMPLATES", "READ_ONLY");
                map.put("MANAGE_BLOG", "READ_ONLY");
                map.put("MANAGE_STORAGE", "NO_ACCESS");
                map.put("MANAGE_SYSTEM", "NO_ACCESS");
            }
        }
        return map;
    }
}
