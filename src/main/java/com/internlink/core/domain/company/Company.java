package com.internlink.core.domain.company;

import com.internlink.core.shared.domain.BaseEntity;
import com.internlink.core.shared.enums.VerificationStatus;
import com.internlink.core.domain.auth.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.time.OffsetDateTime;
import java.util.Map;



@Entity
@Table(name = "companies")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Company extends BaseEntity {

    @Column(name = "company_name", nullable = false)
    private String companyName;

    @Column(name = "tax_code", nullable = false, unique = true, length = 50)
    private String taxCode;

    @Column(name = "industry", length = 100)
    private String industry;

    @Column(name = "website")
    private String website;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "address", columnDefinition = "jsonb", nullable = false)
    private Map<String, Object> address;

    @Column(columnDefinition = "text")
    private String description;
    @Column(name = "employee_range", length = 100)
    private String employeeRange;
    @Column(name = "logo_url", columnDefinition = "text")
    private String logoUrl;
    @Column(name = "cover_image_url", columnDefinition = "text")
    private String coverImageUrl;
    @Column(name = "office_address", length = 1000)
    private String officeAddress;
    @Column(name = "map_embed_url", columnDefinition = "text")
    private String mapEmbedUrl;
    @Column(name = "maps_url", columnDefinition = "text")
    private String mapsUrl;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    @Column(name = "verification_status", nullable = false, length = 30)
    private VerificationStatus verificationStatus = VerificationStatus.PENDING;

    @JdbcTypeCode(SqlTypes.JSON)
    @Builder.Default
    @Column(name = "verification_detail", columnDefinition = "jsonb", nullable = false)
    private Map<String, Object> verificationDetail = Map.of();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "verified_by_user_id")
    private User verifiedBy;

    @Column(name = "verified_at")
    private OffsetDateTime verifiedAt;
}
