package com.internlink.core.domain.ai_matching;

import com.internlink.core.domain.auth.User;
import com.internlink.core.domain.system.Document;
import com.internlink.core.shared.enums.ProficiencyLevel;
import com.internlink.core.shared.enums.SkillSource;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.Map;

@Entity
@Table(name = "student_skills")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudentSkill {

    @EmbeddedId
    private StudentSkillId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("studentId")
    @JoinColumn(name = "student_id", nullable = false)
    private User student;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("skillId")
    @JoinColumn(name = "skill_id", nullable = false)
    private SkillTaxonomy skill;

    @Enumerated(EnumType.STRING)
    @Column(name = "source", nullable = false, length = 30)
    private SkillSource source;

    @Enumerated(EnumType.STRING)
    @Column(name = "proficiency_level", length = 30)
    private ProficiencyLevel proficiencyLevel;

    @Column(name = "confidence", precision = 5, scale = 4)
    private BigDecimal confidence;

    @Builder.Default
    @Column(name = "is_confirmed", nullable = false)
    private Boolean isConfirmed = false;

    @JdbcTypeCode(SqlTypes.JSON)
    @Builder.Default
    @Column(name = "ai_evidence", columnDefinition = "jsonb", nullable = false)
    private Map<String, Object> aiEvidence = Map.of();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "evidence_document_id")
    private Document evidenceDocument;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;
}
