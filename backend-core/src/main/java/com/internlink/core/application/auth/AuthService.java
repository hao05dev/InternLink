package com.internlink.core.application.auth;

import com.internlink.core.domain.auth.User;
import com.internlink.core.domain.auth.UserRepository;
import com.internlink.core.exception.ResourceNotFoundException;
import com.internlink.core.exception.UnauthorizedException;
import com.internlink.core.infrastructure.security.CookieUtils;
import com.internlink.core.infrastructure.security.JwtTokenProvider;
import com.internlink.core.infrastructure.security.UserPrincipal;
import com.internlink.core.presentation.auth.dto.request.LoginRequest;
import com.internlink.core.presentation.auth.dto.response.AuthResponse;
import com.internlink.core.presentation.auth.dto.response.UserSummaryDto;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;
    private final CookieUtils cookieUtils;
    private final UserRepository userRepository;

    @Transactional
    public AuthResponse login(LoginRequest request, HttpServletResponse response) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));

            SecurityContextHolder.getContext().setAuthentication(authentication);
            UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();

            // Cập nhật last_login_at
            User user = userRepository.findById(principal.getId())
                    .orElseThrow(() -> new ResourceNotFoundException("User", "id", principal.getId()));
            user.setLastLoginAt(OffsetDateTime.now());
            userRepository.save(user);

            // Tạo JWT và đính kèm vào HttpOnly Cookie
            String token = tokenProvider.generateToken(principal);
            ResponseCookie cookie = cookieUtils.createAccessTokenCookie(token, tokenProvider.getExpirationMs());
            response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());

            return AuthResponse.builder()
                    .userId(principal.getId())
                    .email(principal.getEmail())
                    .fullName(principal.getFullName())
                    .role(principal.getRole())
                    .mustChangePassword(user.getMustChangePassword())
                    .build();

        } catch (BadCredentialsException ex) {
            throw new UnauthorizedException("Email hoặc mật khẩu không chính xác");
        } catch (DisabledException ex) {
            throw new UnauthorizedException("Tài khoản đã bị khóa hoặc chưa kích hoạt");
        }
    }

    public void logout(HttpServletResponse response) {
        ResponseCookie deleteCookie = cookieUtils.deleteAccessTokenCookie();
        response.addHeader(HttpHeaders.SET_COOKIE, deleteCookie.toString());
        SecurityContextHolder.clearContext();
    }

    @Transactional(readOnly = true)
    public UserSummaryDto getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof UserPrincipal principal)) {
            throw new UnauthorizedException("Người dùng chưa đăng nhập");
        }

        User user = userRepository.findById(principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", principal.getId()));

        return UserSummaryDto.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .phoneNumber(user.getPhoneNumber())
                .role(user.getRole())
                .mustChangePassword(user.getMustChangePassword())
                .lastLoginAt(user.getLastLoginAt())
                .isActive(user.getIsActive())
                .build();
    }
}