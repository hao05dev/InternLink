package com.internlink.core.infrastructure.integration.email;

import jakarta.mail.*;
import jakarta.mail.internet.*;

import org.springframework.stereotype.Component;

import java.util.*;

@Component
public class EmailMessageFactory {
    public MimeMessage create(
            Session session, UUID id, String from, String to, String subject, String body) {
        try {
            if (subject == null
                    || subject.isBlank()
                    || subject.contains("\r")
                    || subject.contains("\n")
                    || body == null)
                throw new EmailDeliveryException("invalid_email_content", false, false);
            MimeMessage message =
                    new MimeMessage(session) {
                        @Override
                        protected void updateMessageID() throws MessagingException {
                            setHeader("Message-ID", "<" + id + "@internlink.local>");
                        }
                    };
            message.setFrom(address(from));
            message.setRecipient(Message.RecipientType.TO, address(to));
            message.setHeader("X-InternLink-Template", "plain-v1");
            message.setSubject(subject, "UTF-8");
            message.setText(body, "UTF-8");
            message.setSentDate(new Date());
            message.saveChanges();
            return message;
        } catch (MessagingException ex) {
            throw new EmailDeliveryException("email_address_or_content_invalid", false, false);
        }
    }

    private InternetAddress address(String value) throws AddressException {
        if (value == null || value.contains("\r") || value.contains("\n"))
            throw new AddressException("invalid address");
        var address = new InternetAddress(value, true);
        address.validate();
        return address;
    }
}
