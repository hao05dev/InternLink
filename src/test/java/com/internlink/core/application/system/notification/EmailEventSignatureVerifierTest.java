package com.internlink.core.application.system.notification;

import static org.assertj.core.api.Assertions.assertThat;

import com.internlink.core.infrastructure.integration.email.EmailProperties;

import java.nio.charset.StandardCharsets;
import java.util.HexFormat;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

import org.junit.jupiter.api.Test;

class EmailEventSignatureVerifierTest {

    @Test
    void acceptsValidSignatureAndRejectsModifiedPayload() throws Exception {
        EmailProperties properties = new EmailProperties();
        properties.setEventWebhookSecret("unit-test-secret");
        EmailEventSignatureVerifier verifier = new EmailEventSignatureVerifier(properties);
        String payload = "{\"eventType\":\"DELIVERED\"}";
        String signature = "sha256=" + sign(payload, properties.getEventWebhookSecret());

        assertThat(verifier.verify(payload, signature)).isTrue();
        assertThat(verifier.verify(payload + " ", signature)).isFalse();
        assertThat(verifier.verify(payload, null)).isFalse();
    }

    private String sign(String payload, String secret) throws Exception {
        Mac mac = Mac.getInstance("HmacSHA256");
        mac.init(new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
        return HexFormat.of().formatHex(mac.doFinal(payload.getBytes(StandardCharsets.UTF_8)));
    }
}
