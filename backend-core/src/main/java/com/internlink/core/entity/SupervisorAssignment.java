package com.internlink.core.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "supervisor_assignments", uniqueConstraints = {
        @UniqueConstraint(name = "uq_term_assignment", columnNames = { "internship_term_id", "student_profile_id" })
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SupervisorAssignment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "internship_term_id", nullable = false)
    private Long internshipTermId;

    @Column(name = "student_profile_id", nullable = false)
    private Long studentProfileId;

    @Column(name = "lecturer_user_id", nullable = false)
    private Long lecturerUserId; // User ID của Giảng viên hướng dẫn

    @Column(name = "assigned_by_user_id")
    private Long assignedByUserId; // User ID của Cán bộ Khoa phân công

    @Builder.Default
    @Column(name = "assigned_date")
    private LocalDate assignedDate = LocalDate.now();

    @Builder.Default
    @Column(name = "status", length = 30)
    private String status = "ACTIVE"; // ACTIVE, REASSIGNED, CANCELLED
}