package com.internlink.core.presentation.auth.dto.response;

import com.internlink.core.shared.enums.UserRole;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.Map;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserDetailDto {
    private UUID id;
    private String email;
    private String fullName;
    private String phoneNumber;
    private UserRole role;
    private UUID departmentId;
    private String departmentName;
    private UUID companyId;
    private String companyName;
    private Boolean mustChangePassword;
    private OffsetDateTime lastLoginAt;
    private Boolean isActive;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
    private String authProvider;
    private Map<String, String> permissions;
}
