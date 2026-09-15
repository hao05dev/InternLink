package com.internlink.core.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "satisfaction_surveys")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SatisfactionSurvey {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "learning_agreement_id", nullable = false)
    private Long learningAgreementId;

    @Column(name = "submitted_by_user_id", nullable = false)
    private Long submittedByUserId;

    @Column(name = "target_type", length = 50, nullable = false)
    private String targetType; // COMPANY, UNIVERSITY, STUDENT

    @Column(name = "satisfaction_score", nullable = false)
    private Integer satisfactionScore; // 1 to 5

    @Column(name = "work_environment_rating")
    private Integer workEnvironmentRating; // 1 to 5

    @Column(name = "mentor_support_rating")
    private Integer mentorSupportRating; // 1 to 5

    @Builder.Default
    @Column(name = "would_recommend")
    private Boolean wouldRecommend = true;

    @Column(name = "comments", columnDefinition = "TEXT")
    private String comments;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
