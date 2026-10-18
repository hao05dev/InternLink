package com.internlink.core.application.auth;

import com.internlink.core.application.auth.impl.PasswordManagementServiceImpl;
import com.internlink.core.domain.auth.User;
import com.internlink.core.infrastructure.persistence.jpa.JpaAuthSessionFamilyRepository;
import com.internlink.core.infrastructure.persistence.jpa.JpaUserRepository;
import com.internlink.core.presentation.auth.dto.request.ChangePasswordRequest;
import com.internlink.core.shared.exception.BadRequestException;
import com.internlink.core.shared.exception.ResourceNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PasswordManagementServiceTest {

    @Mock
    private JpaUserRepository userRepository;

    @Mock
    private JpaAuthSessionFamilyRepository sessionFamilyRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    private PasswordManagementServiceImpl service;

    @BeforeEach
    void setUp() {
        service = new PasswordManagementServiceImpl(userRepository, sessionFamilyRepository, passwordEncoder);
    }

    @Test
    void shouldChangePasswordSuccessfully() {
        UUID userId = UUID.randomUUID();
        User user = User.builder()
                .email("user@internlink.vn")
                .passwordHash("old-encoded-hash")
                .mustChangePassword(true)
                .build();
        user.setId(userId);

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("OldPass123", "old-encoded-hash")).thenReturn(true);
        when(passwordEncoder.matches("NewPass123", "old-encoded-hash")).thenReturn(false);
        when(passwordEncoder.encode("NewPass123")).thenReturn("new-encoded-hash");

        ChangePasswordRequest request = ChangePasswordRequest.builder()
                .currentPassword("OldPass123")
                .newPassword("NewPass123")
                .confirmPassword("NewPass123")
                .build();

        service.changePassword(userId, request);

        assertThat(user.getPasswordHash()).isEqualTo("new-encoded-hash");
        assertThat(user.getPasswordChangedAt()).isNotNull();
        assertThat(user.getMustChangePassword()).isFalse();

        verify(userRepository).save(user);
        verify(sessionFamilyRepository).revokeAllActiveFamiliesByUserId(eq(userId), any(), eq("PASSWORD_CHANGED"));
    }

    @Test
    void shouldRejectWhenConfirmPasswordDoesNotMatch() {
        UUID userId = UUID.randomUUID();
        ChangePasswordRequest request = ChangePasswordRequest.builder()
                .currentPassword("OldPass123")
                .newPassword("NewPass123")
                .confirmPassword("DifferentPass")
                .build();

        assertThatThrownBy(() -> service.changePassword(userId, request))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Mật khẩu xác nhận không khớp");
    }

    @Test
    void shouldRejectWhenCurrentPasswordIsIncorrect() {
        UUID userId = UUID.randomUUID();
        User user = User.builder().passwordHash("old-hash").build();
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("WrongPass", "old-hash")).thenReturn(false);

        ChangePasswordRequest request = ChangePasswordRequest.builder()
                .currentPassword("WrongPass")
                .newPassword("NewPass123")
                .confirmPassword("NewPass123")
                .build();

        assertThatThrownBy(() -> service.changePassword(userId, request))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Mật khẩu hiện tại không chính xác");
    }

    @Test
    void shouldRejectWhenNewPasswordIsSameAsCurrentPassword() {
        UUID userId = UUID.randomUUID();
        User user = User.builder().passwordHash("old-hash").build();
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("SamePass123", "old-hash")).thenReturn(true);

        ChangePasswordRequest request = ChangePasswordRequest.builder()
                .currentPassword("SamePass123")
                .newPassword("SamePass123")
                .confirmPassword("SamePass123")
                .build();

        assertThatThrownBy(() -> service.changePassword(userId, request))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("không được trùng");
    }

    @Test
    void shouldThrowResourceNotFoundWhenUserDoesNotExist() {
        UUID userId = UUID.randomUUID();
        when(userRepository.findById(userId)).thenReturn(Optional.empty());

        ChangePasswordRequest request = ChangePasswordRequest.builder()
                .currentPassword("OldPass123")
                .newPassword("NewPass123")
                .confirmPassword("NewPass123")
                .build();

        assertThatThrownBy(() -> service.changePassword(userId, request))
                .isInstanceOf(ResourceNotFoundException.class);
    }
}
