package com.internlink.core.infrastructure.integration.google;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.internlink.core.application.system.notification.EmailOutboxService;
import com.internlink.core.infrastructure.integration.email.EmailProperties;
import com.internlink.core.infrastructure.integration.email.EmailDeliveryException;
import jakarta.mail.*;
import jakarta.mail.internet.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.*;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.stereotype.Service;
import java.io.ByteArrayOutputStream;
import java.net.URI;
import java.util.*;

@Service
public class GmailSender {
    private final GoogleWorkspaceClient google;
    private final ObjectMapper mapper;
    private final String workspaceSender;
    private final EmailProperties settings;
    private final EmailOutboxService queue;

    public GmailSender(GoogleWorkspaceClient google, ObjectMapper mapper,
        @Value("${internlink.google.gmail-sender:}") String sender, EmailProperties settings, EmailOutboxService queue) {
        this.google=google; this.mapper=mapper; this.workspaceSender=sender; this.settings=settings; this.queue=queue;
    }
    /** Existing faculty commands enqueue instead of contacting Gmail during a business transaction. */
    public void send(String recipient, String subject, String body) { queue(recipient,subject,body); }
    public boolean queue(String recipient, String subject, String body) { return queue.enqueueNotice(recipient,subject,body); }

    /** Used only by the committed outbox worker. */
    public String deliver(UUID deliveryId, String recipient, String subject, String body) {
        if (!settings.isEnabled()) throw new EmailDeliveryException("email_disabled",false,false);
        String provider = settings.getProvider().toUpperCase(Locale.ROOT);
        String from = settings.getFrom().isBlank() ? workspaceSender : settings.getFrom();
        try {
            InternetAddress to = address(recipient);
            InternetAddress sender = address(from);
            if ("GMAIL_SMTP".equals(provider)) {
                if (!from.equalsIgnoreCase(settings.getSmtpUsername()) || settings.getSmtpAppPassword().isBlank())
                    throw new EmailDeliveryException("smtp_configuration_missing",false,false);
                JavaMailSenderImpl smtp = smtpClient();
                MimeMessage message = message(smtp.getSession(), deliveryId, sender, to, subject, body);
                smtp.send(message);
                return message.getMessageID();
            }
            if ("GOOGLE_WORKSPACE".equals(provider)) {
                MimeMessage message = message(Session.getInstance(new Properties()), deliveryId, sender, to, subject, body);
                ByteArrayOutputStream bytes = new ByteArrayOutputStream();
                message.writeTo(bytes);
                String raw = Base64.getUrlEncoder().withoutPadding().encodeToString(bytes.toByteArray());
                var result = google.json("POST", URI.create("https://gmail.googleapis.com/gmail/v1/users/me/messages/send"),
                    GoogleWorkspaceClient.GMAIL_SEND, from, mapper.writeValueAsBytes(Map.of("raw",raw)), "application/json");
                if (!result.hasNonNull("id")) throw new EmailDeliveryException("gmail_result_unknown",false,true);
                return result.get("id").asText();
            }
            throw new EmailDeliveryException("email_provider_not_configured",false,false);
        } catch (EmailDeliveryException ex) { throw ex; }
        catch (GoogleWorkspaceClient.GoogleAuthenticationException ex) {
            throw new EmailDeliveryException("google_authentication_failed",ex.retryable(),false);
        }
        catch (GoogleWorkspaceClient.GoogleApiException ex) {
            throw new EmailDeliveryException("gmail_http_" + ex.status(), ex.status()==429 || ex.status()>=500, false);
        } catch (MailAuthenticationException | AddressException ex) {
            throw new EmailDeliveryException("email_auth_or_address_invalid",false,false);
        } catch (MailException ex) {
            Throwable cause=ex;
            while (cause != null) {
                if (cause instanceof java.net.ConnectException)
                    throw new EmailDeliveryException("smtp_connect_failed",true,false);
                cause=cause.getCause();
            }
            throw new EmailDeliveryException("smtp_result_unknown",false,true);
        } catch (Exception ex) {
            throw new EmailDeliveryException("gmail_result_unknown",false,true);
        }
    }
    private JavaMailSenderImpl smtpClient() {
        var smtp = new JavaMailSenderImpl();
        smtp.setHost("smtp.gmail.com"); smtp.setPort(587);
        smtp.setUsername(settings.getSmtpUsername()); smtp.setPassword(settings.getSmtpAppPassword());
        Properties props=smtp.getJavaMailProperties();
        props.setProperty("mail.smtp.auth","true");
        props.setProperty("mail.smtp.starttls.enable","true");
        props.setProperty("mail.smtp.starttls.required","true");
        props.setProperty("mail.smtp.ssl.checkserveridentity","true");
        props.setProperty("mail.smtp.connectiontimeout","5000");
        props.setProperty("mail.smtp.timeout","20000");
        props.setProperty("mail.smtp.writetimeout","20000");
        return smtp;
    }
    private InternetAddress address(String value) throws AddressException {
        if (value==null || value.contains("\r") || value.contains("\n")) throw new AddressException("invalid address");
        InternetAddress address = new InternetAddress(value,true); address.validate(); return address;
    }
    private MimeMessage message(Session session, UUID id, InternetAddress sender, InternetAddress recipient,
                                String subject, String body) throws MessagingException {
        if (subject==null || subject.contains("\r") || subject.contains("\n"))
            throw new EmailDeliveryException("invalid_email_subject",false,false);
        MimeMessage message = new MimeMessage(session) {
            @Override protected void updateMessageID() throws MessagingException {
                setHeader("Message-ID","<" + id + "@internlink.local>");
            }
        };
        message.setFrom(sender); message.setRecipient(Message.RecipientType.TO,recipient);
        message.setSubject(subject,"UTF-8"); message.setText(body,"UTF-8");
        message.setSentDate(new Date()); message.saveChanges();
        return message;
    }
}
