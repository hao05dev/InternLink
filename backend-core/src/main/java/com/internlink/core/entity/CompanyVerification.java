package com.internlink.core.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.Map;

@Entity
@Table(name = "company_verifications")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CompanyVerification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "company_id", nullable = false)
    private Long companyId;

    @Column(name = "reviewed_by_faculty_id", nullable = false)
    private Long reviewedByFacultyId;

    @Column(name = "status", length = 30, nullable = false)
    private String status; // VERIFIED, REJECTED

    @Column(name = "review_notes", columnDefinition = "TEXT")
    private String reviewNotes;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "checklist_passed", columnDefinition = "jsonb")
    private Map<String, Object> checklistPassed; // Lưu các tiêu chí ILO 208 đã đạt

    @CreationTimestamp
    @Column(name = "reviewed_at", updatable = false)
    private LocalDateTime reviewedAt;
}