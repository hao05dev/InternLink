package com.internlink.core.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "jobs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Job {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "company_id", nullable = false)
    private Long companyId;

    @Column(name = "title", length = 200, nullable = false)
    private String title;

    @Column(name = "description", columnDefinition = "TEXT", nullable = false)
    private String description;

    @Column(name = "target_major", length = 100)
    private String targetMajor; // e.g., "Kỹ thuật phần mềm", "An toàn thông tin"

    @Column(name = "location_raw", length = 150)
    private String locationRaw;

    @Builder.Default
    @Column(name = "work_format", length = 30)
    private String workFormat = "ONSITE"; // ONSITE, HYBRID, REMOTE

    @Builder.Default
    @Column(name = "slots")
    private Integer slots = 1; // Số lượng tuyển

    @Builder.Default
    @Column(name = "filled_slots")
    private Integer filledSlots = 0; // Số lượng đã tuyển được

    @Column(name = "stipend_range", length = 100)
    private String stipendRange; // e.g., "6,000,000 - 8,000,000 VND / tháng"

    @Column(name = "benefits", columnDefinition = "TEXT")
    private String benefits;

    @Column(name = "expected_learning_outcomes", columnDefinition = "TEXT")
    private String expectedLearningOutcomes; // Chuẩn đầu ra thực tập theo NACE/Erasmus+

    @Builder.Default
    @Column(name = "status", length = 30)
    private String status = "PENDING_APPROVAL"; // DRAFT, PENDING_APPROVAL, APPROVED, REJECTED, CLOSED

    @Column(name = "faculty_feedback", columnDefinition = "TEXT")
    private String facultyFeedback;

    @Column(name = "approved_by_user_id")
    private Long approvedByUserId;

    @Builder.Default
    @Column(name = "version")
    private Integer version = 1;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}