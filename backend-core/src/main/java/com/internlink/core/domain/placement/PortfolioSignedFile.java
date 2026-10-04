package com.internlink.core.domain.placement;

import com.internlink.core.domain.auth.User;
import com.internlink.core.shared.domain.BaseEntity;

import jakarta.persistence.*;

import lombok.*;

@Entity
@Table(name = "portfolio_signed_files")
@Getter
@Setter
@NoArgsConstructor
public class PortfolioSignedFile extends BaseEntity {
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "form_id", nullable = false)
    private PortfolioForm form;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "revision_id", nullable = false)
    private PortfolioRevision revision;

    private String fileName;
    private String mimeType;

    @Column(columnDefinition = "bytea")
    private byte[] bytes;

    @Enumerated(EnumType.STRING)
    private com.internlink.core.shared.enums.StorageProvider storageProvider;

    private String providerFileId;
    private String providerFolderId;
    private Long sizeBytes;
    private String checksum;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "uploaded_by", nullable = false)
    private User uploadedBy;
}
