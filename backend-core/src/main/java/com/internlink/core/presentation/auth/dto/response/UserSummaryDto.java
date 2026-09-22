package com.internlink.core.presentation.auth.dto.response;

import com.internlink.core.common.enums.UserRole;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.OffsetDateTime;
import java.util.UUID;



@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserSummaryDto {

    private UUID id;
    private String email;
    private String fullName;
    private String phoneNumber;
    private UserRole role;
    private Boolean mustChangePassword;
    private OffsetDateTime lastLoginAt;
    private Boolean isActive;
}