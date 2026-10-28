package com.internlink.core.infrastructure.integration.email;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.util.Set;

import org.junit.jupiter.api.Test;

class EmailPropertiesTest {

    @Test
    void disabledModeDoesNotRequireProviderCredentials() {
        EmailProperties properties = new EmailProperties();
        properties.setEnabled(true);

        properties.validate();

        assertThat(properties.accepts("student@example.com")).isFalse();
    }

    @Test
    void redirectModeRoutesEveryMessageToTestInbox() {
        EmailProperties properties = validProperties("REDIRECT");
        properties.setRedirectTo("qa@internlink.edu.vn");

        properties.validate();

        assertThat(properties.accepts("student@external.example")).isTrue();
        assertThat(properties.routeRecipient("student@external.example"))
                .isEqualTo("qa@internlink.edu.vn");
        assertThat(properties.routeSubject("student@external.example", "Mời phỏng vấn"))
                .contains("student@external.example", "Mời phỏng vấn");
    }

    @Test
    void allowlistBlocksRecipientsOutsideConfiguredSet() {
        EmailProperties properties = validProperties("ALLOWLIST");
        properties.setAllowedRecipients(Set.of("qa@internlink.edu.vn", " "));

        properties.validate();

        assertThat(properties.accepts("QA@internlink.edu.vn")).isTrue();
        assertThat(properties.accepts("student@external.example")).isFalse();
    }

    @Test
    void liveModeRejectsPersonalSenderAndLocalUrl() {
        EmailProperties properties = validProperties("LIVE");
        properties.setFrom("internlink.test@gmail.com");
        properties.setSmtpUsername("internlink.test@gmail.com");

        assertThatThrownBy(properties::validate)
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("HTTPS");

        properties.setPublicBaseUrl("https://internlink.edu.vn");
        assertThatThrownBy(properties::validate)
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("free-mail");
    }

    @Test
    void liveModeRequiresWebhookSecret() {
        EmailProperties properties = validProperties("LIVE");
        properties.setPublicBaseUrl("https://internlink.edu.vn");

        assertThatThrownBy(properties::validate)
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("EMAIL_EVENT_WEBHOOK_SECRET");

        properties.setEventWebhookSecret("a-secure-webhook-secret-with-32-chars");
        properties.validate();
        assertThat(properties.accepts("student@example.com")).isTrue();
    }

    private EmailProperties validProperties(String mode) {
        EmailProperties properties = new EmailProperties();
        properties.setEnabled(true);
        properties.setDeliveryMode(mode);
        properties.setProvider("GMAIL_SMTP");
        properties.setFrom("mailer@internlink.edu.vn");
        properties.setSmtpUsername("mailer@internlink.edu.vn");
        properties.setSmtpAppPassword("test-app-password");
        properties.setPublicBaseUrl("http://localhost:3000");
        return properties;
    }
}
