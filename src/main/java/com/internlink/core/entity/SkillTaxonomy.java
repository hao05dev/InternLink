package com.internlink.core.entity;

import com.internlink.core.common.enums.SkillCategory;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.type.SqlTypes;

import java.time.OffsetDateTime;
import java.util.List;

@Entity
@Table(name = "skill_taxonomies")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SkillTaxonomy {

    @Id
    @Column(name = "id", length = 50)
    private String id; // e.g. "SK-SPRING-BOOT"

    @Column(name = "skill_name", nullable = false, length = 150)
    private String skillName;

    @Enumerated(EnumType.STRING)
    @Column(name = "category", nullable = false, length = 50)
    private SkillCategory category;

    @Builder.Default
    @Column(name = "framework", nullable = false, length = 50)
    private String framework = "ESCO";

    @Column(name = "description", columnDefinition = "text")
    private String description;

    @JdbcTypeCode(SqlTypes.JSON)
    @Builder.Default
    @Column(name = "aliases", columnDefinition = "jsonb", nullable = false)
    private List<String> aliases = List.of();

    @Column(name = "taxonomy_version", nullable = false, length = 50)
    private String taxonomyVersion;

    @Builder.Default
    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;
}
