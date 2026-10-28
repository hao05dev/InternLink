package com.internlink.core.infrastructure.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import lombok.RequiredArgsConstructor;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Date;
import java.util.Optional;
import java.util.UUID;

/**
 * Đảm nhiệm duy nhất 1 nhiệm vụ: Lọc HTTP Request, trích xuất JWT và thiết lập Security Context
 * sau khi phối hợp kiểm tra tính hợp lệ, trạng thái thu hồi và an toàn của tài khoản.
 */
@Component
@RequiredArgsConstructor
public class JwtFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(JwtFilter.class);

    private final JwtUtil jwtUtil;
    private final CustomUserDetailService userDetailService;
    private final CookieUtils cookieUtils;
    private final TokenRevocationService tokenRevocationService;
    private final UserSecurityStateValidator userSecurityStateValidator;

    @Override
    protected void doFilterInternal(
            HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        try {
            String jwt = getJwtFromRequest(request);

            if (StringUtils.hasText(jwt) && jwtUtil.validateToken(jwt)) {
                String jti = jwtUtil.getJtiFromToken(jwt);

                // 1. Kiểm tra Blacklist (Token đã bị Logout hoặc thu hồi chủ động chưa)
                if (jti != null && tokenRevocationService.isRevoked(jti)) {
                    log.debug("Token với JTI [{}] đã bị thu hồi (Blacklisted)", jti);
                } else {
                    UUID userId = jwtUtil.getUserIdFromToken(jwt);
                    CustomUserDetail userDetails = (CustomUserDetail) userDetailService.loadUserById(userId);
                    Date issuedAt = jwtUtil.getIssuedAtFromToken(jwt);

                    // 2. Kiểm tra trạng thái tài khoản và thời điểm đổi mật khẩu
                    if (userSecurityStateValidator.isTokenValidForUser(userDetails, issuedAt,
                            jwtUtil.getSecurityStampFromToken(jwt))) {
                        UsernamePasswordAuthenticationToken authentication =
                                new UsernamePasswordAuthenticationToken(
                                        userDetails, null, userDetails.getAuthorities());
                        authentication.setDetails(
                                new WebAuthenticationDetailsSource().buildDetails(request));

                        SecurityContextHolder.getContext().setAuthentication(authentication);
                    } else {
                        log.debug("Token không còn hợp lệ do trạng thái tài khoản user [{}]", userId);
                    }
                }
            }
        } catch (Exception ex) {
            log.error("Không thể xác thực người dùng trong Security Context: {}", ex.getMessage());
        }

        filterChain.doFilter(request, response);
    }

    private String getJwtFromRequest(HttpServletRequest request) {
        // Ưu tiên 1: Đọc từ HttpOnly Cookie
        Optional<String> tokenFromCookie = cookieUtils.extractTokenFromCookie(request);
        if (tokenFromCookie.isPresent()) {
            return tokenFromCookie.get();
        }

        // Ưu tiên 2: Fallback qua Authorization Header (Dành cho Swagger / Postman / Mobile)
        String bearerToken = request.getHeader("Authorization");
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }

        return null;
    }
}
