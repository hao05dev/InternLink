package com.internlink.core.application.auth.impl;

import com.internlink.core.application.auth.AuthService;
import com.internlink.core.domain.auth.User;
import com.internlink.core.infrastructure.persistence.jpa.JpaUserRepository;
import com.internlink.core.infrastructure.security.CookieUtils;
import com.internlink.core.infrastructure.security.CustomUserDetail;
import com.internlink.core.infrastructure.security.JwtUtil;
import com.internlink.core.presentation.auth.dto.request.LoginRequest;
import com.internlink.core.presentation.auth.dto.response.AuthResponse;
import com.internlink.core.presentation.auth.dto.response.UserSummaryDto;
import com.internlink.core.shared.exception.ResourceNotFoundException;
import com.internlink.core.shared.exception.UnauthorizedException;
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
public class AuthServiceImpl implements AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;
    private final CookieUtils cookieUtils;
    private final JpaUserRepository userRepository;

    @Override
    @Transactional
    public AuthResponse login(LoginRequest request, HttpServletResponse response) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
            );

            SecurityContextHolder.getContext().setAuthentication(authentication);
            CustomUserDetail principal = (CustomUserDetail) authentication.getPrincipal();

            // Cập nhật last_login_at
            User user = userRepository.findById(principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", principal.getId()));
            user.setLastLoginAt(OffsetDateTime.now());
            userRepository.save(user);

            // Tạo JWT và đính kèm vào HttpOnly Cookie
            String token = jwtUtil.generateToken(principal);
            ResponseCookie cookie = cookieUtils.createAccessTokenCookie(token, jwtUtil.getExpirationMs());
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

    @Override
    public void logout(HttpServletResponse response) {
        ResponseCookie deleteCookie = cookieUtils.deleteAccessTokenCookie();
        response.addHeader(HttpHeaders.SET_COOKIE, deleteCookie.toString());
        SecurityContextHolder.clearContext();
    }

    @Override
    @Transactional(readOnly = true)
    public UserSummaryDto getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof CustomUserDetail principal)) {
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
            .departmentId(user.getDepartment() != null ? user.getDepartment().getId() : null)
            .companyId(user.getCompany() != null ? user.getCompany().getId() : null)
            .mustChangePassword(user.getMustChangePassword())
            .lastLoginAt(user.getLastLoginAt())
            .isActive(user.getIsActive())
            .build();
    }
}
