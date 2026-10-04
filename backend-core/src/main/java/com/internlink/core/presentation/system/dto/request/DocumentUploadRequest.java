package com.internlink.core.presentation.system.dto.request;

import com.internlink.core.shared.enums.*;

import jakarta.validation.constraints.*;

import java.util.UUID;

public record DocumentUploadRequest(
        @NotNull ContextType contextType,
        @NotNull UUID contextId,
        @NotNull DocumentType documentType,
        @NotBlank @Size(max = 180) String fileName,
        @NotBlank @Size(max = 150) String mimeType,
        @Min(1) @Max(20971520) long sizeBytes,
        @Pattern(regexp = "[a-f0-9]{64}") @NotNull String checksum) {}
