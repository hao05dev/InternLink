package com.internlink.core.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "matching_results", uniqueConstraints = {
        @UniqueConstraint(name = "uq_matching_pair", columnNames = { "job_id", "student_profile_id" })
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MatchingResult {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "job_id", nullable = false)
    private Long jobId;

    @Column(name = "student_profile_id", nullable = false)
    private Long studentProfileId;

    @Column(name = "skill_score")
    private Double skillScore; // Điểm khớp kỹ năng (0.0 -> 1.0)

    @Column(name = "semantic_score")
    private Double semanticScore; // Điểm tương đồng ngữ nghĩa qua Embedding

    @Column(name = "academic_score")
    private Double academicScore; // Điểm GPA & môn học nền tảng

    @Column(name = "overall_score")
    private Double overallScore; // Điểm tổng hợp trọng số

    @Column(name = "match_percentage")
    private Double matchPercentage; // % phù hợp (e.g., 85.5%)

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "matched_skills", columnDefinition = "jsonb")
    private List<String> matchedSkills; // Kỹ năng sinh viên đã có và job yêu cầu

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "missing_skills", columnDefinition = "jsonb")
    private List<String> missingSkills; // Kỹ năng job yêu cầu mà sinh viên còn thiếu

    @Column(name = "recommendation", columnDefinition = "TEXT")
    private String recommendation; // Lời khuyên cụ thể từ AI

    @CreationTimestamp
    @Column(name = "calculated_at", updatable = false)
    private LocalDateTime calculatedAt;
}