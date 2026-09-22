package com.internlink.core.presentation.auth.dto.response;

import com.internlink.core.common.enums.UserRole;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.UUID;



@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {

    private UUID userId;
    private String email;
    private String fullName;
    private UserRole role;
    private Boolean mustChangePassword;
}