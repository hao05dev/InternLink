package com.internlink.core.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "EVALUATION_COMMITTEE")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EvaluationCommittee {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID_COMMITTEE")
    private Integer id;

    @Column(name = "NAME_COMMITTEE", length = 150, nullable = false)
    private String nameCommittee;

    @Column(name = "SEMESTER", length = 20)
    private String semester; // e.g., "HK1", "HK2", "SUMMER"

    @Column(name = "ACADEMIC_YEAR", length = 20)
    private String academicYear; // e.g., "2025-2026"

    @Column(name = "EVALUATION_DATE")
    private LocalDate evaluationDate;

    @Builder.Default
    @Column(name = "STATUS", length = 30)
    private String status = "ACTIVE"; // ACTIVE, COMPLETED, DISSOLVED
}