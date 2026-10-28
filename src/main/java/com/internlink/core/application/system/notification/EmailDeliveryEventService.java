package com.internlink.core.application.system.notification;

import com.internlink.core.infrastructure.persistence.jdbc.EmailDeliveryEventStore;
import com.internlink.core.presentation.system.dto.request.ProviderEmailEventRequest;
import com.internlink.core.shared.exception.BadRequestException;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;

import java.util.Set;

@Service
@RequiredArgsConstructor
public class EmailDeliveryEventService {
    private final EmailDeliveryEventStore store;

    public void record(ProviderEmailEventRequest event) {
        if (event == null
                || event.eventType() == null
                || !Set.of("DELIVERED", "BOUNCED").contains(event.eventType().toUpperCase()))
            throw new BadRequestException("Loại sự kiện email không hợp lệ");
        if (event.outboxId() == null
                && (event.providerMessageId() == null || event.providerMessageId().isBlank()))
            throw new BadRequestException("Sự kiện email thiếu mã đối soát");
        if (event.providerMessageId() != null && event.providerMessageId().length() > 300)
            throw new BadRequestException("Mã đối soát email quá dài");
        if (event.errorCode() != null && event.errorCode().length() > 200)
            throw new BadRequestException("Mã lỗi email quá dài");
        if (event.metadata() != null && event.metadata().toString().length() > 10_000)
            throw new BadRequestException("Metadata sự kiện email quá lớn");
        store.record(event);
    }
}
