package com.internlink.core.domain.placement;

import com.internlink.core.shared.domain.BaseEntity;
import com.internlink.core.domain.auth.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.time.OffsetDateTime;
import java.util.*;

@Entity @Table(name="portfolio_forms") @Getter @Setter @NoArgsConstructor
public class PortfolioForm extends BaseEntity {
    @ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="placement_id",nullable=false) private InternshipPlacement placement;
    private String kind;
    private String templateVersion = "CTU-2026-v1";
    @JdbcTypeCode(SqlTypes.JSON) @Column(columnDefinition="jsonb",nullable=false) private Map<String,Object> content = new LinkedHashMap<>();
    private String status = "DRAFT";
    private boolean published;
    @ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="published_by") private User publishedBy;
    private OffsetDateTime publishedAt;
    @Column(columnDefinition="text") private String feedback;
    @ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="updated_by") private User updatedBy;
    @ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="report_id") private InternshipReport report;
}
