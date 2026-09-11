package com.internlink.core.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "MATCHING_RESULT")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MatchingResult {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID_MATCHING")
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ID_IP", nullable = false)
    private InternshipPosting internshipPosting;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ID_SP", nullable = false)
    private Student student;

    @Column(name = "SKILL_MATCH_SCORE")
    private Double skillMatchScore;

    @Column(name = "EXPERIENCE_SCORE")
    private Double experienceScore;

    @Column(name = "GPA_SCORE")
    private Double gpaScore;

    @Column(name = "OVERALL_SCORE")
    private Double overallScore;

    @Column(name = "EXPLANATION", columnDefinition = "TEXT")
    private String explanation; // Explanation why the candidate matches or what skills are missing

    @Column(name = "MODEL_NAME", length = 100)
    private String modelName;

    @CreationTimestamp
    @Column(name = "CREATED_AT", updatable = false)
    private LocalDateTime createdAt;
}