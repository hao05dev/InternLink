package com.internlink.core.security;

import java.io.IOException;
import org.springframework.security.access.AccessDeniedException;
import java.time.Instant;
import java.util.Map;

import org.springframework.http.MediaType;
import org.springframework.http.HttpStatus;

import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.stereotype.Component;

import com.fasterxml.jackson.databind.ObjectMapper;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class CustomAccessDeniedHandler implements AccessDeniedHandler {

    @Override
    public void handle(HttpServletRequest request, HttpServletResponse response,
            AccessDeniedException accessDeniedException) throws IOException {
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setStatus(HttpStatus.FORBIDDEN.value());

        Map<String, Object> body = Map.of("status", HttpStatus.FORBIDDEN.value(), "error", "Forbidden", "message",
                "Access denied. You do not have the required role or authority to perform this action.", "path",
                request.getServletPath(), "timestamp", Instant.now().toString());
        new ObjectMapper().writeValue(response.getOutputStream(), body);
    }
}
