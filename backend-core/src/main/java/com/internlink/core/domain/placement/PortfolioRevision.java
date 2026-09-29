package com.internlink.core.domain.placement;

import com.internlink.core.shared.domain.BaseEntity;
import com.internlink.core.domain.auth.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.util.*;

@Entity @Table(name="portfolio_revisions") @Getter @Setter @NoArgsConstructor
public class PortfolioRevision extends BaseEntity {
    @ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="form_id",nullable=false) private PortfolioForm form;
    private String action;
    @JdbcTypeCode(SqlTypes.JSON) @Column(columnDefinition="jsonb",nullable=false) private Map<String,Object> content;
    @Column(columnDefinition="bytea") private byte[] docx;
    @ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="actor_id",nullable=false) private User actor;
    @Column(columnDefinition="text") private String note;
}
