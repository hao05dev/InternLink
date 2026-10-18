package com.internlink.core.infrastructure.security;

import com.internlink.core.shared.enums.UserRole;
import jakarta.servlet.FilterChain;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Date;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class JwtFilterTest {

    @Mock
    private JwtUtil jwtUtil;

    @Mock
    private CustomUserDetailService userDetailService;

    @Mock
    private CookieUtils cookieUtils;

    @Mock
    private TokenRevocationService tokenRevocationService;

    @Mock
    private UserSecurityStateValidator userSecurityStateValidator;

    @Mock
    private HttpServletRequest request;

    @Mock
    private HttpServletResponse response;

    @Mock
    private FilterChain filterChain;

    private JwtFilter jwtFilter;

    @BeforeEach
    void setUp() {
        SecurityContextHolder.clearContext();
        jwtFilter = new JwtFilter(jwtUtil, userDetailService, cookieUtils, tokenRevocationService, userSecurityStateValidator);
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void shouldAuthenticateWhenValidTokenInCookie() throws Exception {
        UUID userId = UUID.randomUUID();
        String rawJwt = "valid-cookie-jwt";
        Date issuedAt = new Date();

        CustomUserDetail userDetails = CustomUserDetail.builder()
                .id(userId)
                .email("student@internlink.vn")
                .role(UserRole.STUDENT)
                .authorities(List.of())
                .isActive(true)
                .build();

        when(cookieUtils.extractTokenFromCookie(request)).thenReturn(Optional.of(rawJwt));
        when(jwtUtil.validateToken(rawJwt)).thenReturn(true);
        when(jwtUtil.getJtiFromToken(rawJwt)).thenReturn("jti-123");
        when(tokenRevocationService.isRevoked("jti-123")).thenReturn(false);
        when(jwtUtil.getUserIdFromToken(rawJwt)).thenReturn(userId);
        when(userDetailService.loadUserById(userId)).thenReturn(userDetails);
        when(jwtUtil.getIssuedAtFromToken(rawJwt)).thenReturn(issuedAt);
        when(userSecurityStateValidator.isTokenValidForUser(userDetails, issuedAt)).thenReturn(true);

        jwtFilter.doFilter(request, response, filterChain);

        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNotNull();
        assertThat(SecurityContextHolder.getContext().getAuthentication().getPrincipal()).isEqualTo(userDetails);
        verify(filterChain).doFilter(request, response);
    }

    @Test
    void shouldAuthenticateWhenValidTokenInAuthorizationHeaderFallback() throws Exception {
        UUID userId = UUID.randomUUID();
        String rawJwt = "header-jwt-token";
        Date issuedAt = new Date();

        CustomUserDetail userDetails = CustomUserDetail.builder()
                .id(userId)
                .email("admin@internlink.vn")
                .role(UserRole.ADMIN)
                .authorities(List.of())
                .isActive(true)
                .build();

        when(cookieUtils.extractTokenFromCookie(request)).thenReturn(Optional.empty());
        when(request.getHeader("Authorization")).thenReturn("Bearer " + rawJwt);
        when(jwtUtil.validateToken(rawJwt)).thenReturn(true);
        when(jwtUtil.getJtiFromToken(rawJwt)).thenReturn("jti-header");
        when(tokenRevocationService.isRevoked("jti-header")).thenReturn(false);
        when(jwtUtil.getUserIdFromToken(rawJwt)).thenReturn(userId);
        when(userDetailService.loadUserById(userId)).thenReturn(userDetails);
        when(jwtUtil.getIssuedAtFromToken(rawJwt)).thenReturn(issuedAt);
        when(userSecurityStateValidator.isTokenValidForUser(userDetails, issuedAt)).thenReturn(true);

        jwtFilter.doFilter(request, response, filterChain);

        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNotNull();
        verify(filterChain).doFilter(request, response);
    }

    @Test
    void shouldNotAuthenticateWhenTokenIsRevokedInBlacklist() throws Exception {
        String rawJwt = "revoked-jwt";

        when(cookieUtils.extractTokenFromCookie(request)).thenReturn(Optional.of(rawJwt));
        when(jwtUtil.validateToken(rawJwt)).thenReturn(true);
        when(jwtUtil.getJtiFromToken(rawJwt)).thenReturn("jti-revoked");
        when(tokenRevocationService.isRevoked("jti-revoked")).thenReturn(true);

        jwtFilter.doFilter(request, response, filterChain);

        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
        verify(filterChain).doFilter(request, response);
        verify(userDetailService, never()).loadUserById(any());
    }

    @Test
    void shouldNotAuthenticateWhenSecurityStateValidatorRejects() throws Exception {
        UUID userId = UUID.randomUUID();
        String rawJwt = "stale-jwt";
        Date issuedAt = new Date();

        CustomUserDetail userDetails = CustomUserDetail.builder()
                .id(userId)
                .isActive(false) // Bị khóa
                .authorities(List.of())
                .build();

        when(cookieUtils.extractTokenFromCookie(request)).thenReturn(Optional.of(rawJwt));
        when(jwtUtil.validateToken(rawJwt)).thenReturn(true);
        when(jwtUtil.getJtiFromToken(rawJwt)).thenReturn("jti-stale");
        when(tokenRevocationService.isRevoked("jti-stale")).thenReturn(false);
        when(jwtUtil.getUserIdFromToken(rawJwt)).thenReturn(userId);
        when(userDetailService.loadUserById(userId)).thenReturn(userDetails);
        when(jwtUtil.getIssuedAtFromToken(rawJwt)).thenReturn(issuedAt);
        when(userSecurityStateValidator.isTokenValidForUser(userDetails, issuedAt)).thenReturn(false);

        jwtFilter.doFilter(request, response, filterChain);

        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
        verify(filterChain).doFilter(request, response);
    }

    @Test
    void shouldContinueFilterChainWhenNoTokenProvided() throws Exception {
        when(cookieUtils.extractTokenFromCookie(request)).thenReturn(Optional.empty());
        when(request.getHeader("Authorization")).thenReturn(null);

        jwtFilter.doFilter(request, response, filterChain);

        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
        verify(filterChain).doFilter(request, response);
    }
}
