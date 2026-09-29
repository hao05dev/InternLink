package com.internlink.core.infrastructure.integration.google;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.security.KeyFactory;
import java.security.PrivateKey;
import java.security.Signature;
import java.security.spec.PKCS8EncodedKeySpec;
import java.time.Duration;
import java.time.Instant;
import java.util.Base64;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/** Google Workspace REST client using a service-account key kept outside the repository. */
@Component
public class GoogleWorkspaceClient {
    public static final String SHEETS_READ = "https://www.googleapis.com/auth/spreadsheets.readonly";
    public static final String DRIVE_FILE = "https://www.googleapis.com/auth/drive.file";
    public static final String GMAIL_SEND = "https://www.googleapis.com/auth/gmail.send";

    private final ObjectMapper mapper;
    private final HttpClient http = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(10)).build();
    private final String keyPath;
    private final Map<String, Token> tokens = new ConcurrentHashMap<>();

    public GoogleWorkspaceClient(ObjectMapper mapper,
        @Value("${internlink.google.service-account-key-path:}") String keyPath) {
        this.mapper = mapper;
        this.keyPath = keyPath;
    }

    public JsonNode json(String method, URI uri, String scope, String delegatedUser, byte[] body, String contentType) {
        try {
            HttpRequest.Builder request = HttpRequest.newBuilder(uri).timeout(Duration.ofSeconds(30))
                .header("Authorization", "Bearer " + token(scope, delegatedUser));
            if (contentType != null) request.header("Content-Type", contentType);
            request.method(method, body == null ? HttpRequest.BodyPublishers.noBody() : HttpRequest.BodyPublishers.ofByteArray(body));
            HttpResponse<byte[]> response = http.send(request.build(), HttpResponse.BodyHandlers.ofByteArray());
            if (response.statusCode() / 100 != 2)
                throw new IllegalStateException("Google API trả về HTTP " + response.statusCode() + ": " + truncate(response.body()));
            return response.body().length == 0 ? mapper.createObjectNode() : mapper.readTree(response.body());
        } catch (IOException | InterruptedException error) {
            if (error instanceof InterruptedException) Thread.currentThread().interrupt();
            throw new IllegalStateException("Không kết nối được Google Workspace", error);
        }
    }

    public byte[] bytes(URI uri, String scope) {
        try {
            HttpRequest request = HttpRequest.newBuilder(uri).timeout(Duration.ofSeconds(30))
                .header("Authorization", "Bearer " + token(scope, null)).GET().build();
            HttpResponse<byte[]> response = http.send(request, HttpResponse.BodyHandlers.ofByteArray());
            if (response.statusCode() / 100 != 2)
                throw new IllegalStateException("Google Drive trả về HTTP " + response.statusCode());
            return response.body();
        } catch (IOException | InterruptedException error) {
            if (error instanceof InterruptedException) Thread.currentThread().interrupt();
            throw new IllegalStateException("Không tải được tệp Google Drive", error);
        }
    }

    public static String encode(String value) { return URLEncoder.encode(value, StandardCharsets.UTF_8).replace("+", "%20"); }

    private synchronized String token(String scope, String delegatedUser) {
        String cacheKey = scope + "|" + (delegatedUser == null ? "" : delegatedUser);
        Token cached = tokens.get(cacheKey);
        if (cached != null && cached.expiresAt.isAfter(Instant.now().plusSeconds(60))) return cached.value;
        if (keyPath == null || keyPath.isBlank())
            throw new IllegalStateException("Thiếu GOOGLE_SERVICE_ACCOUNT_KEY_PATH để dùng Google Workspace");
        try {
            JsonNode credential = mapper.readTree(Files.readAllBytes(Path.of(keyPath)));
            String issuer = credential.path("client_email").asText();
            String pem = credential.path("private_key").asText().replace("-----BEGIN PRIVATE KEY-----", "")
                .replace("-----END PRIVATE KEY-----", "").replaceAll("\\s", "");
            PrivateKey key = KeyFactory.getInstance("RSA").generatePrivate(new PKCS8EncodedKeySpec(Base64.getDecoder().decode(pem)));
            long now = Instant.now().getEpochSecond();
            var claims = mapper.createObjectNode().put("iss", issuer).put("scope", scope)
                .put("aud", "https://oauth2.googleapis.com/token").put("iat", now).put("exp", now + 3600);
            if (delegatedUser != null && !delegatedUser.isBlank()) claims.put("sub", delegatedUser);
            String header = base64(mapper.writeValueAsBytes(Map.of("alg", "RS256", "typ", "JWT")));
            String payload = base64(mapper.writeValueAsBytes(claims));
            String unsigned = header + "." + payload;
            Signature signer = Signature.getInstance("SHA256withRSA");
            signer.initSign(key);
            signer.update(unsigned.getBytes(StandardCharsets.UTF_8));
            String assertion = unsigned + "." + base64(signer.sign());
            String form = "grant_type=" + encode("urn:ietf:params:oauth:grant-type:jwt-bearer") + "&assertion=" + encode(assertion);
            HttpRequest request = HttpRequest.newBuilder(URI.create("https://oauth2.googleapis.com/token"))
                .timeout(Duration.ofSeconds(20)).header("Content-Type", "application/x-www-form-urlencoded")
                .POST(HttpRequest.BodyPublishers.ofString(form)).build();
            HttpResponse<String> response = http.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() != 200)
                throw new IllegalStateException("Google OAuth từ chối tài khoản dịch vụ (HTTP " + response.statusCode() + ")");
            JsonNode token = mapper.readTree(response.body());
            String value = token.path("access_token").asText();
            if (value.isBlank()) throw new IllegalStateException("Google OAuth không cấp access token");
            tokens.put(cacheKey, new Token(value, Instant.now().plusSeconds(token.path("expires_in").asLong(3600))));
            return value;
        } catch (Exception error) {
            if (error instanceof InterruptedException) Thread.currentThread().interrupt();
            if (error instanceof IllegalStateException state) throw state;
            throw new IllegalStateException("Không thể lấy Google Workspace access token", error);
        }
    }

    private static String base64(byte[] value) { return Base64.getUrlEncoder().withoutPadding().encodeToString(value); }
    private static String truncate(byte[] bytes) {
        String value = new String(bytes, StandardCharsets.UTF_8);
        return value.substring(0, Math.min(value.length(), 300));
    }
    private record Token(String value, Instant expiresAt) {}
}
