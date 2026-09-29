package com.internlink.core.domain.placement;

import com.internlink.core.shared.domain.BaseEntity;
import com.internlink.core.domain.auth.User;
import jakarta.persistence.*;
import lombok.*;

@Entity @Table(name="portfolio_signed_files") @Getter @Setter @NoArgsConstructor
public class PortfolioSignedFile extends BaseEntity {
    @ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="form_id",nullable=false) private PortfolioForm form;
    @ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="revision_id",nullable=false) private PortfolioRevision revision;
    private String fileName;
    private String mimeType;
    @Column(columnDefinition="bytea",nullable=false) private byte[] bytes;
    @ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="uploaded_by",nullable=false) private User uploadedBy;
}
