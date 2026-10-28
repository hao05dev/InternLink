package com.internlink.core.application.auth;

import com.internlink.core.application.auth.impl.RefreshTokenServiceImpl;
import com.internlink.core.domain.auth.AuthSessionFamily;
import com.internlink.core.domain.auth.RefreshToken;
import com.internlink.core.domain.auth.User;
import com.internlink.core.infrastructure.persistence.jpa.JpaAuthSessionFamilyRepository;
import com.internlink.core.infrastructure.persistence.jpa.JpaRefreshTokenRepository;
import com.internlink.core.infrastructure.security.CookieUtils;
import com.internlink.core.infrastructure.security.JwtUtil;
import com.internlink.core.infrastructure.security.TokenCryptoUtils;
import com.internlink.core.presentation.auth.dto.response.AuthResponse;
import com.internlink.core.shared.enums.UserRole;
import com.internlink.core.shared.exception.UnauthorizedException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseCookie;

import java.time.OffsetDateTime;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RefreshTokenServiceTest {

    @Mock
    private JpaAuthSessionFamilyRepository familyRepository;

    @Mock
    private JpaRefreshTokenRepository tokenRepository;

    @Mock
    private TokenCryptoUtils cryptoUtils;

    @Mock
    private CookieUtils cookieUtils;

    @Mock
    private JwtUtil jwtUtil;
    @Mock
    private com.internlink.core.infrastructure.persistence.jpa.JpaUserRepository users;

    @Mock
    private HttpServletRequest httpRequest;

    @Mock
    private HttpServletResponse httpResponse;

    private RefreshTokenServiceImpl service;

    @BeforeEach
    void setUp() {
        service = new RefreshTokenServiceImpl(
                familyRepository,
                tokenRepository,
                cryptoUtils,
                cookieUtils,
                jwtUtil,
                users
        );
    }

    @Test
    void shouldCreateSessionAndTokenSuccessfully() {
        User user = User.builder().email("student@internlink.vn").build();
        user.setId(UUID.randomUUID());

        when(users.findByIdForUpdate(user.getId())).thenReturn(Optional.of(user));

        AuthSessionFamily family = AuthSessionFamily.builder().user(user).build();
        family.setId(UUID.randomUUID());

        when(httpRequest.getHeader("User-Agent")).thenReturn("Mozilla/5.0");
        when(httpRequest.getRemoteAddr()).thenReturn("127.0.0.1");
        when(familyRepository.save(any(AuthSessionFamily.class))).thenReturn(family);
        when(cryptoUtils.generateSecureRandomToken()).thenReturn("raw-refresh-123");
        when(cryptoUtils.hashToken("raw-refresh-123")).thenReturn("hash-123");
        when(cookieUtils.createRefreshTokenCookie(anyString(), anyLong()))
                .thenReturn(ResponseCookie.from("refresh_token", "raw-refresh-123").build());

        String resultToken = service.createSessionAndToken(user, httpRequest, httpResponse);

        assertThat(resultToken).isEqualTo("raw-refresh-123");
        verify(familyRepository).save(any(AuthSessionFamily.class));
        verify(tokenRepository).save(any(RefreshToken.class));
        verify(httpResponse).addHeader(eq("Set-Cookie"), anyString());
    }

    @Test
    void shouldRotateTokenSuccessfullyWhenTokenIsActive() {
        User user = User.builder()
                .email("student@internlink.vn")
                .fullName("Nguyen Van A")
                .role(UserRole.STUDENT)
                .isActive(true)
                .mustChangePassword(false)
                .build();
        user.setId(UUID.randomUUID());

        AuthSessionFamily family = AuthSessionFamily.builder()
                .user(user)
                .absoluteExpiresAt(OffsetDateTime.now().plusDays(30))
                .build();
        family.setId(UUID.randomUUID());

        RefreshToken currentToken = RefreshToken.builder()
                .family(family)
                .tokenHash("old-hash")
                .expiresAt(OffsetDateTime.now().plusDays(7))
                .build();
        currentToken.setId(UUID.randomUUID());

        RefreshToken newToken = RefreshToken.builder()
                .family(family)
                .tokenHash("new-hash")
                .expiresAt(OffsetDateTime.now().plusDays(7))
                .build();
        newToken.setId(UUID.randomUUID());

        when(cookieUtils.extractRefreshTokenFromCookie(httpRequest)).thenReturn(Optional.of("raw-old-token"));
        when(cryptoUtils.hashToken("raw-old-token")).thenReturn("old-hash");
        when(tokenRepository.findByTokenHashWithFamilyAndUser("old-hash")).thenReturn(Optional.of(currentToken));
        when(cryptoUtils.generateSecureRandomToken()).thenReturn("raw-new-token");
        when(cryptoUtils.hashToken("raw-new-token")).thenReturn("new-hash");
        when(tokenRepository.save(any(RefreshToken.class))).thenReturn(newToken);
        when(jwtUtil.generateToken(any())).thenReturn("new-jwt-access-token");
        when(jwtUtil.getExpirationMs()).thenReturn(86400000L);
        when(cookieUtils.createAccessTokenCookie(anyString(), anyLong()))
                .thenReturn(ResponseCookie.from("access_token", "new-jwt-access-token").build());
        when(cookieUtils.createRefreshTokenCookie(anyString(), anyLong()))
                .thenReturn(ResponseCookie.from("refresh_token", "raw-new-token").build());

        AuthResponse response = service.rotateRefreshToken(httpRequest, httpResponse);

        assertThat(response).isNotNull();
        assertThat(response.getEmail()).isEqualTo("student@internlink.vn");
        assertThat(currentToken.getConsumedAt()).isNotNull();
        assertThat(currentToken.getReplacedById()).isEqualTo(newToken.getId());

        verify(tokenRepository, times(2)).save(any(RefreshToken.class));
    }

    @Test
    void shouldDetectReplayAttackAndRevokeEntireFamily() {
        User user = User.builder().email("victim@internlink.vn").isActive(true).build();
        user.setId(UUID.randomUUID());

        AuthSessionFamily family = AuthSessionFamily.builder()
                .user(user)
                .absoluteExpiresAt(OffsetDateTime.now().plusDays(30))
                .build();
        family.setId(UUID.randomUUID());

        // Token đã bị consumed trước đó!
        RefreshToken consumedToken = RefreshToken.builder()
                .family(family)
                .tokenHash("replayed-hash")
                .consumedAt(OffsetDateTime.now().minusMinutes(5))
                .expiresAt(OffsetDateTime.now().plusDays(7))
                .build();

        when(cookieUtils.extractRefreshTokenFromCookie(httpRequest)).thenReturn(Optional.of("stolen-token"));
        when(cryptoUtils.hashToken("stolen-token")).thenReturn("replayed-hash");
        when(tokenRepository.findByTokenHashWithFamilyAndUser("replayed-hash")).thenReturn(Optional.of(consumedToken));
        when(cookieUtils.deleteAccessTokenCookie()).thenReturn(ResponseCookie.from("access_token", "").build());
        when(cookieUtils.deleteRefreshTokenCookie()).thenReturn(ResponseCookie.from("refresh_token", "").build());

        assertThatThrownBy(() -> service.rotateRefreshToken(httpRequest, httpResponse))
                .isInstanceOf(UnauthorizedException.class)
                .hasMessageContaining("Phát hiện bất thường");

        assertThat(family.getRevokedAt()).isNotNull();
        assertThat(family.getRevokeReason()).isEqualTo("REPLAY_DETECTED");
        verify(familyRepository).save(family);
    }
}
