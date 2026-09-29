package com.internlink.core.presentation.auth.controller;

import com.internlink.core.application.system.AuditLogService;
import com.internlink.core.domain.auth.User;
import com.internlink.core.infrastructure.persistence.jpa.JpaCompanyRepository;
import com.internlink.core.infrastructure.persistence.jpa.JpaDepartmentRepository;
import com.internlink.core.infrastructure.persistence.jpa.JpaUserRepository;
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

    @GetMapping
    @Transactional(readOnly = true)
    public ResponseEntity<ApiResponse<List<UserSummaryDto>>> list() {
        return ResponseEntity.ok(ApiResponse.success(users.findAll().stream().map(this::toDto).toList()));
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
    public ResponseEntity<ApiResponse<UserSummaryDto>> update(@PathVariable UUID id,
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
        return ResponseEntity.ok(ApiResponse.success(toDto(saved)));
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
}
