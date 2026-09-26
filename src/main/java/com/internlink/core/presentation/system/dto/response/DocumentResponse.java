package com.internlink.core.presentation.system.dto.response;

import com.internlink.core.shared.enums.ContextType;
import com.internlink.core.shared.enums.DocumentType;
import com.internlink.core.shared.enums.StorageProvider;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DocumentResponse {

    private UUID id;
    private UUID ownerUserId;
    private String ownerName;
    private ContextType contextType;
    private UUID contextId;
    private DocumentType documentType;
    private StorageProvider storageProvider;
    private String originalName;
    private String mimeType;
    private Long sizeBytes;
    private String externalUrl;
    private String visibility;
    private String status;
    private OffsetDateTime createdAt;
}