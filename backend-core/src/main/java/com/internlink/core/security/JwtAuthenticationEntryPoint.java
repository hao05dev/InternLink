package com.internlink.core.security;

import java.io.IOException;
import java.time.Instant;
import java.util.Map;

import org.springframework.security.core.AuthenticationException;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import com.fasterxml.jackson.databind.ObjectMapper;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class JwtAuthenticationEntryPoint implements AuthenticationEntryPoint {
    @Override
    public void commence(HttpServletRequest request, HttpServletResponse response,
            AuthenticationException authenException) throws IOException {
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setStatus(HttpStatus.UNAUTHORIZED.value());

        Map<String, Object> body = Map.of("status", HttpStatus.UNAUTHORIZED.value(), "error", "Unauthorized", "message",
                "full authentication is required to access this resource or token is invalid/expired.", "path",
                request.getServletPath(), "timestamp", Instant.now().toString());
        new ObjectMapper().writeValue(response.getOutputStream(), body);
    }
}
