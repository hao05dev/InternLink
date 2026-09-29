package com.internlink.core.infrastructure.integration.google;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.Map;

@Service
public class GmailSender {
    private final GoogleWorkspaceClient google;
    private final ObjectMapper mapper;
    private final String sender;

    public GmailSender(GoogleWorkspaceClient google, ObjectMapper mapper,
        @Value("${internlink.google.gmail-sender:}") String sender) {
        this.google = google;
        this.mapper = mapper;
        this.sender = sender;
    }

    public void send(String recipient, String subject, String body) {
        if (sender.isBlank()) throw new IllegalStateException("Thiếu GOOGLE_GMAIL_SENDER");
        if (!recipient.matches("^[^@\\s\\r\\n]+@[^@\\s\\r\\n]+\\.[^@\\s\\r\\n]+$"))
            throw new IllegalArgumentException("Email sinh viên không hợp lệ");
        try {
            String encodedSubject = "=?UTF-8?B?" + Base64.getEncoder().encodeToString(subject.getBytes(StandardCharsets.UTF_8)) + "?=";
            String encodedBody = Base64.getMimeEncoder(76, "\r\n".getBytes(StandardCharsets.US_ASCII))
                .encodeToString(body.getBytes(StandardCharsets.UTF_8));
            String mime = "From: " + sender + "\r\nTo: " + recipient + "\r\nSubject: " + encodedSubject
                + "\r\nMIME-Version: 1.0\r\nContent-Type: text/plain; charset=UTF-8"
                + "\r\nContent-Transfer-Encoding: base64\r\n\r\n" + encodedBody;
            String raw = Base64.getUrlEncoder().withoutPadding().encodeToString(mime.getBytes(StandardCharsets.UTF_8));
            google.json("POST", URI.create("https://gmail.googleapis.com/gmail/v1/users/me/messages/send"),
                GoogleWorkspaceClient.GMAIL_SEND, sender,
                mapper.writeValueAsBytes(Map.of("raw", raw)), "application/json");
        } catch (Exception error) {
            if (error instanceof RuntimeException runtime) throw runtime;
            throw new IllegalStateException("Không gửi được Gmail", error);
        }
    }
}
