package com.internlink.core.application.auth.impl;

import com.internlink.core.application.auth.AuthService;
import com.internlink.core.domain.auth.User;
import com.internlink.core.infrastructure.persistence.jpa.JpaUserRepository;
import com.internlink.core.infrastructure.security.CookieUtils;
import com.internlink.core.infrastructure.security.CustomUserDetail;
import com.internlink.core.infrastructure.security.JwtUtil;
import com.internlink.core.infrastructure.security.TokenRevocationService;
import com.internlink.core.presentation.auth.dto.request.LoginRequest;
import com.internlink.core.presentation.auth.dto.response.AuthResponse;
import com.internlink.core.presentation.auth.dto.response.UserSummaryDto;
import com.internlink.core.shared.exception.ResourceNotFoundException;
import com.internlink.core.shared.exception.UnauthorizedException;
import jakarta.servlet.http.HttpServletRequest;
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
import org.springframework.util.StringUtils;

import java.time.OffsetDateTime;
import java.util.Date;
import java.util.Optional;
import java.util.UUID;

import com.internlink.core.application.system.NotificationService;
import com.internlink.core.domain.company.Company;
import com.internlink.core.infrastructure.persistence.jpa.JpaCompanyRepository;
import com.internlink.core.presentation.auth.dto.request.RegisterCompanyRequest;
import com.internlink.core.shared.enums.UserRole;
import com.internlink.core.shared.enums.VerificationStatus;
import com.internlink.core.shared.exception.BadRequestException;
import org.springframework.security.crypto.password.PasswordEncoder;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;
    private final CookieUtils cookieUtils;
    private final JpaUserRepository userRepository;
    private final JpaCompanyRepository companyRepository;
    private final PasswordEncoder passwordEncoder;
    private final NotificationService notificationService;
    private final TokenRevocationService tokenRevocationService;

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
    @Transactional
    public AuthResponse registerCompany(RegisterCompanyRequest request, HttpServletResponse response) {
        String cleanEmail = request.getEmail().trim().toLowerCase();
        if (userRepository.existsByEmail(cleanEmail)) {
            throw new BadRequestException("Email '" + cleanEmail + "' đã được sử dụng trong hệ thống");
        }

        String cleanTaxCode = request.getTaxCode().trim();
        if (companyRepository.existsByTaxCode(cleanTaxCode)) {
            throw new BadRequestException("Mã số thuế '" + cleanTaxCode + "' đã tồn tại trong hệ thống");
        }

        Company company = Company.builder()
            .companyName(request.getCompanyName().trim())
            .taxCode(cleanTaxCode)
            .industry(request.getIndustry())
            .website(request.getWebsite())
            .address(request.getAddress())
            .verificationStatus(VerificationStatus.PENDING)
            .verificationDetail(Map.of("registeredBy", cleanEmail, "registeredAt", OffsetDateTime.now().toString()))
            .build();
        Company savedCompany = companyRepository.save(company);

        User user = User.builder()
            .email(cleanEmail)
            .passwordHash(passwordEncoder.encode(request.getPassword()))
            .fullName(request.getFullName().trim())
            .phoneNumber(request.getPhoneNumber() != null ? request.getPhoneNumber().trim() : null)
            .role(UserRole.COMPANY_REP)
            .company(savedCompany)
            .mustChangePassword(false)
            .isActive(true)
            .build();
        User savedUser = userRepository.save(user);

        for (UserRole role : List.of(UserRole.FACULTY_ADMIN, UserRole.ADMIN)) {
            userRepository.findByRole(role).forEach(admin ->
                notificationService.sendNotification(
                    admin.getId(),
                    "COMPANY_REGISTERED",
                    "Doanh nghiệp mới chờ thẩm định",
                    savedCompany.getCompanyName() + " đã đăng ký tài khoản tham gia hệ thống.",
                    role == UserRole.ADMIN ? "/admin/companies" : "/faculty/companies"
                )
            );
        }

        CustomUserDetail principal = CustomUserDetail.create(savedUser);
        String token = jwtUtil.generateToken(principal);
        ResponseCookie cookie = cookieUtils.createAccessTokenCookie(token, jwtUtil.getExpirationMs());
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());

        return AuthResponse.builder()
            .userId(savedUser.getId())
            .email(savedUser.getEmail())
            .fullName(savedUser.getFullName())
            .role(savedUser.getRole())
            .mustChangePassword(savedUser.getMustChangePassword())
            .build();
    }

    @Override
    public void logout(HttpServletRequest request, HttpServletResponse response) {
        if (request != null) {
            String token = extractToken(request);
            if (StringUtils.hasText(token) && jwtUtil.validateToken(token)) {
                String jti = jwtUtil.getJtiFromToken(token);
                Date expiryDate = jwtUtil.getExpirationDateFromToken(token);
                tokenRevocationService.revokeToken(jti, expiryDate);
            }
        }
        ResponseCookie deleteCookie = cookieUtils.deleteAccessTokenCookie();
        response.addHeader(HttpHeaders.SET_COOKIE, deleteCookie.toString());
        SecurityContextHolder.clearContext();
    }

    private String extractToken(HttpServletRequest request) {
        Optional<String> tokenFromCookie = cookieUtils.extractTokenFromCookie(request);
        if (tokenFromCookie.isPresent()) {
            return tokenFromCookie.get();
        }
        String bearerToken = request.getHeader(HttpHeaders.AUTHORIZATION);
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
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
