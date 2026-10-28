package com.internlink.core.infrastructure.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import java.time.Instant;
import java.util.Set;
import static org.assertj.core.api.Assertions.*;

class GoogleTokenVerifierTest {
    private final ObjectMapper json = new ObjectMapper();
    @Test void validatesAudienceIssuerExpiryAndHostedDomain() {
        var properties = new GoogleAuthProperties();
        properties.setClientId("internlink-client");
        properties.setHostedDomains(Set.of("ctu.edu.vn"));
        var verifier = new DefaultGoogleTokenVerifier(json, properties);
        var claims = json.createObjectNode().put("aud", "internlink-client")
                .put("iss", "https://accounts.google.com").put("exp", Instant.now().plusSeconds(300).getEpochSecond())
                .put("sub", "google-sub").put("email", "teacher@ctu.edu.vn").put("email_verified", true)
                .put("hd", "ctu.edu.vn");
        assertThat(verifier.validateClaims(claims).sub()).isEqualTo("google-sub");
        for (String key : new String[]{"aud", "iss", "hd", "azp"}) {
            var invalid = claims.deepCopy().put(key, "other");
            assertThatThrownBy(() -> verifier.validateClaims(invalid)).isInstanceOf(RuntimeException.class);
        }
        assertThatThrownBy(() -> verifier.validateClaims(claims.deepCopy().put("exp", 1)))
                .isInstanceOf(RuntimeException.class);
    }
    @Test void disabledProviderFailsWithoutNetworkCall() {
        var verifier = new DefaultGoogleTokenVerifier(json, new GoogleAuthProperties());
        assertThatThrownBy(() -> verifier.verify("token")).hasMessageContaining("chưa được bật");
    }

    @Test void verifiesSignatureBeforeConvertingVerifiedClaims() throws Exception {
        var properties = new GoogleAuthProperties();
        properties.setEnabled(true);
        properties.setClientId("internlink-client");
        var googleVerifier = org.mockito.Mockito.mock(
                com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier.class);
        var token = org.mockito.Mockito.mock(com.google.api.client.googleapis.auth.oauth2.GoogleIdToken.class);
        var payload = new com.google.api.client.googleapis.auth.oauth2.GoogleIdToken.Payload();
        payload.set("aud", "internlink-client");
        payload.set("iss", "https://accounts.google.com");
        payload.set("exp", Instant.now().plusSeconds(300).getEpochSecond());
        payload.set("sub", "verified-sub");
        payload.set("email", "user@example.test");
        payload.set("email_verified", true);
        org.mockito.Mockito.when(token.getPayload()).thenReturn(payload);
        org.mockito.Mockito.when(googleVerifier.verify("valid-token")).thenReturn(token);
        var verifier = new DefaultGoogleTokenVerifier(json, properties);
        org.springframework.test.util.ReflectionTestUtils.setField(verifier, "verifier", googleVerifier);
        assertThat(verifier.verify("valid-token").sub()).isEqualTo("verified-sub");
        assertThatThrownBy(() -> verifier.verify("forged-token")).isInstanceOf(RuntimeException.class);
    }
}
