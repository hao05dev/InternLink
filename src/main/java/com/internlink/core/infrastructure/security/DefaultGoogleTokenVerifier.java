package com.internlink.core.infrastructure.security;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.internlink.core.shared.exception.UnauthorizedException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;

/**
 * Triển khai mặc định gọi trực tiếp endpoint tokeninfo của Google OAuth2.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class DefaultGoogleTokenVerifier implements GoogleTokenVerifier {

    private final ObjectMapper objectMapper;
    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .build();

    @Override
    public GoogleUserInfo verify(String idToken) {
        if (idToken == null || idToken.isBlank()) {
            throw new UnauthorizedException("Google ID Token không được để trống");
        }
        try {
            String encodedToken = URLEncoder.encode(idToken, StandardCharsets.UTF_8);
            HttpRequest httpReq = HttpRequest.newBuilder(
                    URI.create("https://oauth2.googleapis.com/tokeninfo?id_token=" + encodedToken))
                    .timeout(Duration.ofSeconds(10))
                    .GET()
                    .build();

            HttpResponse<String> httpRes = httpClient.send(httpReq, HttpResponse.BodyHandlers.ofString());
            if (httpRes.statusCode() != 200) {
                log.warn("Xác minh Google Token thất bại. HTTP Status: {}", httpRes.statusCode());
                throw new UnauthorizedException("Google ID Token không hợp lệ hoặc đã hết hạn");
            }

            JsonNode json = objectMapper.readTree(httpRes.body());
            String sub = json.path("sub").asText();
            String email = json.path("email").asText();
            boolean emailVerified = json.path("email_verified").asBoolean(
                    "true".equalsIgnoreCase(json.path("email_verified").asText()));
            String name = json.has("name") ? json.path("name").asText() : email;

            if (sub.isBlank() || email.isBlank()) {
                throw new UnauthorizedException("Dữ liệu danh tính Google không đầy đủ");
            }

            return new GoogleUserInfo(sub, email, name, emailVerified);
        } catch (UnauthorizedException e) {
            throw e;
        } catch (Exception ex) {
            log.error("Lỗi khi kết nối Google OAuth endpoint: {}", ex.getMessage());
            throw new UnauthorizedException("Không thể xác minh danh tính tài khoản Google");
        }
    }
}
