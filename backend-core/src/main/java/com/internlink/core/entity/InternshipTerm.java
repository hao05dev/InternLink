package com.internlink.core.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "internship_terms")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InternshipTerm {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "name", length = 150, nullable = false)
    private String name; // Ví dụ: "Học kỳ 1 - Năm học 2026-2027"

    @Column(name = "academic_year", length = 30, nullable = false)
    private String academicYear; // Ví dụ: "2026-2027"

    @Column(name = "semester", nullable = false)
    private Integer semester; // 1, 2, 3 (Học kỳ hè)

    @Column(name = "department_id")
    private Long departmentId;

    @Column(name = "registration_start_date", nullable = false)
    private LocalDate registrationStartDate;

    @Column(name = "registration_deadline", nullable = false)
    private LocalDate registrationDeadline;

    @Column(name = "internship_start_date", nullable = false)
    private LocalDate internshipStartDate;

    @Column(name = "internship_end_date", nullable = false)
    private LocalDate internshipEndDate;

    @Builder.Default
    @Column(name = "max_credits")
    private Integer maxCredits = 10;

    @Builder.Default
    @Column(name = "status", length = 30)
    private String status = "OPEN"; // UPCOMING, OPEN, IN_PROGRESS, CLOSED

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}