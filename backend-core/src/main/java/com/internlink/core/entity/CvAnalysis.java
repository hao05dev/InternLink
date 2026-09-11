package com.internlink.core.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.Map;

@Entity
@Table(name = "CV_ANALYSIS")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CvAnalysis {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID_ANALYSIS")
    private Integer id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ID_CV", nullable = false, unique = true)
    private CurriculumVitae curriculumVitae;

    // Direct mapping for PostgreSQL JSONB column in Hibernate 6
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "EXTRACTED_SKILLS", columnDefinition = "jsonb")
    private Map<String, Object> extractedSkills;

    @Column(name = "EDUCATION_INFO", columnDefinition = "TEXT")
    private String educationInfo;

    @Column(name = "EXPERIENCE_INFO", columnDefinition = "TEXT")
    private String experienceInfo;

    @Column(name = "AI_SCORE")
    private Double aiScore;

    @Column(name = "MODEL_NAME", length = 100)
    private String modelName; // e.g., "gemini-1.5-flash", "vietnamese-bi-encoder"

    @CreationTimestamp
    @Column(name = "CREATED_AT", updatable = false)
    private LocalDateTime createdAt;
}