package com.internlink.core.infrastructure.integration.email;

import static org.assertj.core.api.Assertions.assertThat;

import jakarta.mail.Message;
import jakarta.mail.Session;
import jakarta.mail.internet.InternetAddress;

import java.util.Properties;
import java.util.UUID;

import org.junit.jupiter.api.Test;

class EmailMessageFactoryTest {

    @Test
    void createsBrandedMessageWithSenderDomainMessageId() throws Exception {
        UUID id = UUID.randomUUID();

        var message =
                new EmailMessageFactory()
                        .create(
                                Session.getInstance(new Properties()),
                                id,
                                "mailer@internlink.edu.vn",
                                "student@example.com",
                                "Mời phỏng vấn",
                                "Nội dung");

        InternetAddress from = (InternetAddress) message.getFrom()[0];
        assertThat(from.getPersonal()).isEqualTo("InternLink");
        assertThat(message.getReplyTo()).containsExactly(message.getFrom());
        assertThat(message.getRecipients(Message.RecipientType.TO)[0].toString())
                .isEqualTo("student@example.com");
        assertThat(message.getMessageID()).isEqualTo("<" + id + "@internlink.edu.vn>");
    }
}
