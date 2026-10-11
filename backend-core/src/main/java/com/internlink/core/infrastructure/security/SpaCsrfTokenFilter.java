package com.internlink.core.infrastructure.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * Đảm nhiệm duy nhất 1 nhiệm vụ: Kích hoạt đánh giá CsrfToken để đảm bảo
 * Cookie XSRF-TOKEN được sinh ra và gửi về trình duyệt cho SPA (Single Page Application).
 */
public class SpaCsrfTokenFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        CsrfToken csrfToken = (CsrfToken) request.getAttribute(CsrfToken.class.getName());
        if (csrfToken != null) {
            // Render giá trị token để Spring Security CookieCsrfTokenRepository đẩy cookie về client
            csrfToken.getToken();
        }
        filterChain.doFilter(request, response);
    }
}
