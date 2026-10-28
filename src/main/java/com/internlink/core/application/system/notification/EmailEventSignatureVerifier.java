package com.internlink.core.application.system.notification;

import com.internlink.core.infrastructure.integration.email.EmailProperties;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.HexFormat;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

@Component
@RequiredArgsConstructor
public class EmailEventSignatureVerifier {
    private final EmailProperties properties;

    public boolean verify(String payload, String providedSignature) {
        String secret = properties.getEventWebhookSecret();
        if (secret == null || secret.isBlank() || providedSignature == null) return false;
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            String expected = HexFormat.of().formatHex(mac.doFinal(payload.getBytes(StandardCharsets.UTF_8)));
            String provided = providedSignature.startsWith("sha256=")
                    ? providedSignature.substring(7)
                    : providedSignature;
            return MessageDigest.isEqual(
                    expected.getBytes(StandardCharsets.US_ASCII),
                    provided.toLowerCase().getBytes(StandardCharsets.US_ASCII));
        } catch (Exception ex) {
            return false;
        }
    }
}
