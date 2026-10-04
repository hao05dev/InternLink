package com.internlink.core.application.system.notification;

import java.util.UUID;

public interface EmailDeliveryGateway {
    String deliver(UUID deliveryId, String recipient, String subject, String body);
}
