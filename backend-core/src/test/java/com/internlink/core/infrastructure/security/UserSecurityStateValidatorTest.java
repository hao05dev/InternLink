package com.internlink.core.infrastructure.security;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.OffsetDateTime;
import java.util.Date;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

class UserSecurityStateValidatorTest {

    private UserSecurityStateValidator validator;

    @BeforeEach
    void setUp() {
        validator = new UserSecurityStateValidator();
    }

    @Test
    void shouldRejectDisabledUser() {
        CustomUserDetail user = CustomUserDetail.builder()
                .id(UUID.randomUUID())
                .isActive(false)
                .authorities(List.of())
                .build();

        boolean valid = validator.isTokenValidForUser(user, new Date());
        assertThat(valid).isFalse();
    }

    @Test
    void shouldAcceptUserWhenPasswordNotChanged() {
        CustomUserDetail user = CustomUserDetail.builder()
                .id(UUID.randomUUID())
                .isActive(true)
                .passwordChangedAt(null)
                .authorities(List.of())
                .build();

        boolean valid = validator.isTokenValidForUser(user, new Date());
        assertThat(valid).isTrue();
    }

    @Test
    void shouldRejectTokenIssuedBeforePasswordChange() {
        OffsetDateTime passwordChangedAt = OffsetDateTime.now();
        Date tokenIssuedAt = new Date(passwordChangedAt.toInstant().toEpochMilli() - 10000L); // 10s trước

        CustomUserDetail user = CustomUserDetail.builder()
                .id(UUID.randomUUID())
                .isActive(true)
                .passwordChangedAt(passwordChangedAt)
                .authorities(List.of())
                .build();

        boolean valid = validator.isTokenValidForUser(user, tokenIssuedAt);
        assertThat(valid).isFalse();
    }

    @Test
    void shouldAcceptTokenIssuedAfterPasswordChange() {
        OffsetDateTime passwordChangedAt = OffsetDateTime.now().minusHours(1);
        Date tokenIssuedAt = new Date(); // Hiện tại

        CustomUserDetail user = CustomUserDetail.builder()
                .id(UUID.randomUUID())
                .isActive(true)
                .passwordChangedAt(passwordChangedAt)
                .authorities(List.of())
                .build();

        boolean valid = validator.isTokenValidForUser(user, tokenIssuedAt);
        assertThat(valid).isTrue();
    }
}
