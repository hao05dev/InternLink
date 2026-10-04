package com.internlink.core.presentation.system.dto.response;

import java.time.OffsetDateTime;
import java.util.*;

public class DocumentUploadResponse {
    public record Capabilities(
            String provider,
            boolean directUpload,
            int maxBytes,
            List<String> mimeTypes,
            boolean scanningEnabled) {}

    public record Ticket(
            UUID id, String uploadUrl, Map<String, String> headers, OffsetDateTime expiresAt) {}
}
