package com.internlink.core.application.auth;

import com.internlink.core.application.auth.impl.GoogleAuthServiceImpl;
import com.internlink.core.domain.auth.User;
import com.internlink.core.infrastructure.persistence.jpa.JpaUserRepository;
import com.internlink.core.infrastructure.security.CookieUtils;
import com.internlink.core.infrastructure.security.GoogleTokenVerifier;
import com.internlink.core.infrastructure.security.JwtUtil;
import com.internlink.core.presentation.auth.dto.request.GoogleLoginRequest;
import com.internlink.core.presentation.auth.dto.response.AuthResponse;
import com.internlink.core.shared.enums.UserRole;
import com.internlink.core.shared.exception.AccountLockedException;
import com.internlink.core.shared.exception.UnauthorizedException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseCookie;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.OffsetDateTime;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class GoogleAuthServiceTest {

    @Mock
    private JpaUserRepository userRepository;

    @Mock
    private RefreshTokenService refreshTokenService;

    @Mock
    private JwtUtil jwtUtil;

    @Mock
    private CookieUtils cookieUtils;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private GoogleTokenVerifier tokenVerifier;

    @Mock
    private HttpServletRequest httpRequest;

    @Mock
    private HttpServletResponse servletResponse;

    private GoogleAuthServiceImpl service;

    @BeforeEach
    void setUp() {
        service = new GoogleAuthServiceImpl(
                userRepository,
                refreshTokenService,
                jwtUtil,
                cookieUtils,
                passwordEncoder,
                tokenVerifier
        );
    }

    @Test
    void shouldLoginExistingUserWithGoogleSubject() {
        GoogleTokenVerifier.GoogleUserInfo googleUser = new GoogleTokenVerifier.GoogleUserInfo(
                "google-sub-12345", "student@internlink.vn", "Nguyen Van A", true);

        when(tokenVerifier.verify("raw-google-id-token")).thenReturn(googleUser);

        User existingUser = User.builder()
                .email("student@internlink.vn")
                .fullName("Nguyen Van A")
                .googleSubject("google-sub-12345")
                .role(UserRole.STUDENT)
                .isActive(true)
                .build();
        existingUser.setId(UUID.randomUUID());

        when(userRepository.findByGoogleSubject("google-sub-12345")).thenReturn(Optional.of(existingUser));
        when(jwtUtil.generateToken(any())).thenReturn("jwt-token-abc");
        when(cookieUtils.createAccessTokenCookie(any(), anyLong()))
                .thenReturn(ResponseCookie.from("access_token", "jwt-token-abc").build());

        AuthResponse response = service.authenticateWithGoogle(
                new GoogleLoginRequest("raw-google-id-token"), httpRequest, servletResponse);

        assertThat(response).isNotNull();
        assertThat(response.getEmail()).isEqualTo("student@internlink.vn");
        verify(refreshTokenService).createSessionAndToken(existingUser, httpRequest, servletResponse);
    }

    @Test
    void shouldLinkGoogleSubjectWhenEmailExistsWithoutGoogleSubject() {
        GoogleTokenVerifier.GoogleUserInfo googleUser = new GoogleTokenVerifier.GoogleUserInfo(
                "new-google-sub-789", "lecturer@internlink.vn", "Teacher B", true);

        when(tokenVerifier.verify("valid-token")).thenReturn(googleUser);

        User localUser = User.builder()
                .email("lecturer@internlink.vn")
                .fullName("Teacher B")
                .role(UserRole.LECTURER)
                .isActive(true)
                .build();
        localUser.setId(UUID.randomUUID());

        when(userRepository.findByGoogleSubject("new-google-sub-789")).thenReturn(Optional.empty());
        when(userRepository.findByEmail("lecturer@internlink.vn")).thenReturn(Optional.of(localUser));
        when(userRepository.save(any(User.class))).thenAnswer(i -> i.getArgument(0));
        when(jwtUtil.generateToken(any())).thenReturn("jwt-token");
        when(cookieUtils.createAccessTokenCookie(any(), anyLong()))
                .thenReturn(ResponseCookie.from("access_token", "jwt-token").build());

        AuthResponse response = service.authenticateWithGoogle(
                new GoogleLoginRequest("valid-token"), httpRequest, servletResponse);

        assertThat(response).isNotNull();
        assertThat(localUser.getGoogleSubject()).isEqualTo("new-google-sub-789");
        assertThat(localUser.getEmailVerifiedAt()).isNotNull();
    }

    @Test
    void shouldAutoProvisionNewUserWhenAccountDoesNotExist() {
        GoogleTokenVerifier.GoogleUserInfo googleUser = new GoogleTokenVerifier.GoogleUserInfo(
                "brand-new-google-sub", "newbie@internlink.vn", "Newbie Intern", true);

        when(tokenVerifier.verify("google-token")).thenReturn(googleUser);
        when(userRepository.findByGoogleSubject("brand-new-google-sub")).thenReturn(Optional.empty());
        when(userRepository.findByEmail("newbie@internlink.vn")).thenReturn(Optional.empty());
        when(passwordEncoder.encode(any())).thenReturn("encoded-password");

        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        when(userRepository.save(userCaptor.capture())).thenAnswer(i -> {
            User u = i.getArgument(0);
            u.setId(UUID.randomUUID());
            return u;
        });
        when(jwtUtil.generateToken(any())).thenReturn("jwt-token");
        when(cookieUtils.createAccessTokenCookie(any(), anyLong()))
                .thenReturn(ResponseCookie.from("access_token", "jwt-token").build());

        AuthResponse response = service.authenticateWithGoogle(
                new GoogleLoginRequest("google-token"), httpRequest, servletResponse);

        assertThat(response).isNotNull();
        User createdUser = userCaptor.getValue();
        assertThat(createdUser.getEmail()).isEqualTo("newbie@internlink.vn");
        assertThat(createdUser.getRole()).isEqualTo(UserRole.STUDENT);
        assertThat(createdUser.getAuthProvider()).isEqualTo("GOOGLE");
    }

    @Test
    void shouldRejectWhenEmailIsNotVerifiedByGoogle() {
        GoogleTokenVerifier.GoogleUserInfo googleUser = new GoogleTokenVerifier.GoogleUserInfo(
                "sub-123", "unverified@gmail.com", "Fake Name", false);

        when(tokenVerifier.verify("token")).thenReturn(googleUser);

        assertThatThrownBy(() -> service.authenticateWithGoogle(
                new GoogleLoginRequest("token"), httpRequest, servletResponse))
                .isInstanceOf(UnauthorizedException.class)
                .hasMessageContaining("chưa được xác thực");
    }

    @Test
    void shouldRejectWhenUserIsLocked() {
        GoogleTokenVerifier.GoogleUserInfo googleUser = new GoogleTokenVerifier.GoogleUserInfo(
                "locked-sub", "locked@internlink.vn", "Locked User", true);

        when(tokenVerifier.verify("token")).thenReturn(googleUser);

        User lockedUser = User.builder()
                .email("locked@internlink.vn")
                .googleSubject("locked-sub")
                .isActive(true)
                .lockedUntil(OffsetDateTime.now().plusMinutes(10))
                .build();
        when(userRepository.findByGoogleSubject("locked-sub")).thenReturn(Optional.of(lockedUser));

        assertThatThrownBy(() -> service.authenticateWithGoogle(
                new GoogleLoginRequest("token"), httpRequest, servletResponse))
                .isInstanceOf(AccountLockedException.class);
    }
}
