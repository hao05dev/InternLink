package com.internlink.core.presentation.system.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.internlink.core.application.system.notification.EmailDeliveryEventService;
import com.internlink.core.application.system.notification.EmailEventSignatureVerifier;
import com.internlink.core.presentation.system.dto.request.ProviderEmailEventRequest;
import com.internlink.core.shared.api.ApiResponse;

import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/v1/public/email-events")
@RequiredArgsConstructor
public class EmailDeliveryEventController {
    private final EmailEventSignatureVerifier signatures;
    private final EmailDeliveryEventService events;
    private final ObjectMapper mapper;

    @PostMapping
    public ApiResponse<Void> receive(
            @RequestHeader(value = "X-InternLink-Email-Signature", required = false) String signature,
            @RequestBody String payload) {
        if (!signatures.verify(payload, signature))
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Chữ ký webhook không hợp lệ");
        try {
            events.record(mapper.readValue(payload, ProviderEmailEventRequest.class));
            return ApiResponse.success("Đã ghi nhận sự kiện email", null);
        } catch (com.fasterxml.jackson.core.JsonProcessingException ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Payload webhook không hợp lệ");
        }
    }
}
