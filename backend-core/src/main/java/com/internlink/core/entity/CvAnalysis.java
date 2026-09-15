package com.internlink.core.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.Map;

@Entity
@Table(name = "cv_analysis")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CvAnalysis {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "cv_id", unique = true, nullable = false)
    private Long cvId;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "extracted_skills", columnDefinition = "jsonb")
    private Map<String, Object> extractedSkills; // Danh sách kỹ năng AI bóc tách được

    @Column(name = "education_info", columnDefinition = "TEXT")
    private String educationInfo;

    @Column(name = "experience_info", columnDefinition = "TEXT")
    private String experienceInfo;

    @Column(name = "ai_score")
    private Double aiScore;

    @Column(name = "model_name", length = 100)
    private String modelName; // e.g., "gemini-1.5-flash", "vietnamese-skills-ner"

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}