package com.internlink.core.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "student_courses")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudentCourse {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "student_profile_id", nullable = false)
    private Long studentProfileId;

    @Column(name = "course_code", length = 30, nullable = false)
    private String courseCode; // e.g., "IT001"

    @Column(name = "course_name", length = 150, nullable = false)
    private String courseName; // e.g., "Lập trình Web nâng cao"

    @Column(name = "grade")
    private Double grade; // e.g., 8.5

    @Builder.Default
    @Column(name = "credits")
    private Integer credits = 3;

    @Column(name = "semester", length = 30)
    private String semester; // e.g., "HK1_2025"
}