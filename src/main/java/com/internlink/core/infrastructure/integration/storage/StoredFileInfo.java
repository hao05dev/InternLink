package com.internlink.core.infrastructure.integration.storage;

import com.internlink.core.shared.enums.StorageProvider;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StoredFileInfo {
    private String providerFileId;
    private String providerFolderId;
    private String storagePathOrUrl;
    private String originalName;
    private String mimeType;
    private Long sizeBytes;
    private String checksum;
    private StorageProvider provider;
}
