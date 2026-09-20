package com.internlink.core.entity;

import com.internlink.core.common.BaseEntity;
import com.internlink.core.common.enums.ContextType;
import com.internlink.core.common.enums.DocumentType;
import com.internlink.core.common.enums.StorageProvider;
import jakarta.persistence.*;
import lombok.*;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "documents")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Document extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_user_id", nullable = false)
    private User owner;

    @Enumerated(EnumType.STRING)
    @Column(name = "context_type", nullable = false, length = 40)
    private ContextType contextType;

    @Column(name = "context_id", nullable = false)
    private UUID contextId;

    @Enumerated(EnumType.STRING)
    @Column(name = "document_type", nullable = false, length = 40)
    private DocumentType documentType;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    @Column(name = "storage_provider", nullable = false, length = 30)
    private StorageProvider storageProvider = StorageProvider.LOCAL;

    @Column(name = "provider_file_id", unique = true)
    private String providerFileId;

    @Column(name = "provider_folder_id")
    private String providerFolderId;

    @Column(name = "external_url", columnDefinition = "text")
    private String externalUrl;

    @Column(name = "original_name")
    private String originalName;

    @Column(name = "mime_type", length = 100)
    private String mimeType;

    @Column(name = "size_bytes")
    private Long sizeBytes;

    @Column(name = "checksum", length = 128)
    private String checksum;

    @Builder.Default
    @Column(name = "visibility", nullable = false, length = 30)
    private String visibility = "PRIVATE";

    @Builder.Default
    @Column(name = "status", nullable = false, length = 30)
    private String status = "ACTIVE";

    @Column(name = "deleted_at")
    private OffsetDateTime deletedAt;
}
