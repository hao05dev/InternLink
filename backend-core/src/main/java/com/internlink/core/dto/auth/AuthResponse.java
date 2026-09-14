package com.internlink.core.dto.auth;

import com.internlink.core.entity.Role;

public record AuthResponse(
        String accessToken,
        String tokenType,
        Long userId, // Khớp với Long ID của User
        String email,
        String fullName,
        Role role) {
    public static AuthResponse of(String token, Long userId, String email, String fullName, Role role) {
        return new AuthResponse(token, "Bearer", userId, email, fullName, role);
    }
}