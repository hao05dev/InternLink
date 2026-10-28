package com.internlink.core.infrastructure.security;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.internlink.core.shared.exception.UnauthorizedException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import java.time.Instant;
import java.util.Set;

/** Verify Google signatures with cached public keys, then enforce local identity policy. */
@Component
@RequiredArgsConstructor
public class DefaultGoogleTokenVerifier implements GoogleTokenVerifier {
    private final ObjectMapper objectMapper;
    private final GoogleAuthProperties properties;
    private volatile GoogleIdTokenVerifier verifier;

    @Override
    public GoogleUserInfo verify(String idToken) {
        if (!properties.isEnabled() || properties.getClientId().isBlank()) {
            throw new UnauthorizedException("Đăng nhập Google chưa được bật.");
        }
        if (idToken == null || idToken.isBlank() || idToken.length() > 10000) {
            throw new UnauthorizedException("Google ID token không hợp lệ");
        }
        try {
            var token = verifier().verify(idToken);
            if (token == null) throw new UnauthorizedException("Google ID token không hợp lệ");
            return validateClaims(objectMapper.valueToTree(token.getPayload()));
        } catch (UnauthorizedException ex) {
            throw ex;
        } catch (Exception ex) {
            throw new UnauthorizedException("Không thể xác minh danh tính Google");
        }
    }

    private synchronized GoogleIdTokenVerifier verifier() {
        if (verifier == null) {
            verifier = new GoogleIdTokenVerifier.Builder(new NetHttpTransport(), GsonFactory.getDefaultInstance())
                    .setAudience(java.util.List.of(properties.getClientId())).build();
        }
        return verifier;
    }

    GoogleUserInfo validateClaims(JsonNode json) {
        String issuer = json.path("iss").asText();
        String azp = json.path("azp").asText();
        boolean valid = properties.getClientId().equals(json.path("aud").asText())
                && (azp.isBlank() || properties.getClientId().equals(azp))
                && Set.of("accounts.google.com", "https://accounts.google.com").contains(issuer)
                && json.path("exp").asLong(0) > Instant.now().getEpochSecond()
                && !json.path("sub").asText().isBlank() && !json.path("email").asText().isBlank()
                && json.path("email_verified").asBoolean()
                && (properties.getHostedDomains().isEmpty()
                    || properties.getHostedDomains().contains(json.path("hd").asText()));
        if (!valid) throw new UnauthorizedException("Google ID token không hợp lệ cho ứng dụng này");
        return new GoogleUserInfo(json.path("sub").asText(), json.path("email").asText(),
                json.path("name").asText(), true);
    }
}
