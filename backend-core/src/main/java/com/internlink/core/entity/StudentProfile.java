package com.internlink.core.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

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

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", unique = true, nullable = false)
    private User user;

    @Column(name = "student_code", unique = true, nullable = false, length = 30)
    private String studentCode;

    @Column(nullable = false, length = 100)
    private String major;

    @Column(name = "academic_year", length = 20)
    private String academicYear;

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

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "preferred_province_id")
    private Province preferredProvince;

    @Column(name = "desired_position", length = 150)
    private String desiredPosition;

    @Builder.Default
    @Column(name = "preferred_work_format", length = 30)
    private String preferredWorkFormat = "ANY";

    @Builder.Default
    @Column(name = "data_sharing_consent")
    private Boolean dataSharingConsent = true;

    @Builder.Default
    @Column(name = "internship_status", length = 30)
    private String internshipStatus = "NOT_STARTED";

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "student_skills",
        joinColumns = @JoinColumn(name = "student_profile_id"),
        inverseJoinColumns = @JoinColumn(name = "skill_id")
    )
    @Builder.Default
    private Set<Skill> skills = new HashSet<>();

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
