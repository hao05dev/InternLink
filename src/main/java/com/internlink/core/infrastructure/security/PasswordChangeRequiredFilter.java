package com.internlink.core.infrastructure.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;
import java.util.Set;

/** Created in SecurityConfig only; not auto-registered as a servlet filter. */
public class PasswordChangeRequiredFilter extends OncePerRequestFilter {
    private static final Set<String> ALLOWED = Set.of("/api/v1/auth/session", "/api/v1/auth/me",
            "/api/v1/auth/change-password", "/api/v1/auth/logout", "/api/v1/auth/csrf");
    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof CustomUserDetail user && user.isMustChangePassword()
                && request.getRequestURI().startsWith("/api/v1/")
                && !ALLOWED.contains(request.getRequestURI()) && !"OPTIONS".equals(request.getMethod())) {
            response.setStatus(403);
            response.setContentType("application/json;charset=UTF-8");
            response.getWriter().write("{\"success\":false,\"message\":\"Vui lòng đổi mật khẩu trước khi sử dụng hệ thống.\"}");
            return;
        }
        chain.doFilter(request, response);
    }
}
