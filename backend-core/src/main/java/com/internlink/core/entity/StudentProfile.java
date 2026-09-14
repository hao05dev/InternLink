package com.internlink.core.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "student_profiles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudentProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", unique = true, nullable = false)
    private Long userId;

    @Column(name = "student_code", length = 30, unique = true, nullable = false)
    private String studentCode;

    @Column(name = "major", length = 100, nullable = false)
    private String major;

    @Column(name = "academic_year", length = 20)
    private String academicYear; // e.g., "K2021"

    @Column(name = "gpa")
    private Double gpa;

    @Column(name = "passed_credits")
    private Integer passedCredits;

    @Column(name = "cv_file_url", columnDefinition = "TEXT")
    private String cvFileUrl;

    @Column(name = "portfolio_url", columnDefinition = "TEXT")
    private String portfolioUrl;

    @Column(name = "github_url", columnDefinition = "TEXT")
    private String githubUrl;

    @Column(name = "linkedin_url", columnDefinition = "TEXT")
    private String linkedinUrl;

    @Column(name = "bio_summary", columnDefinition = "TEXT")
    private String bioSummary;

    @Column(name = "preferred_province_id")
    private Long preferredProvinceId;

    @Column(name = "desired_position", length = 150)
    private String desiredPosition; // e.g., "Java Backend Developer"

    @Builder.Default
    @Column(name = "preferred_work_format", length = 30)
    private String preferredWorkFormat = "ANY"; // ONSITE, HYBRID, REMOTE, ANY

    @Builder.Default
    @Column(name = "data_sharing_consent")
    private Boolean dataSharingConsent = true;

    @Builder.Default
    @Column(name = "internship_status", length = 30)
    private String internshipStatus = "NOT_STARTED"; // NOT_STARTED, LOOKING_FOR_JOB, IN_PROGRESS, COMPLETED

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}