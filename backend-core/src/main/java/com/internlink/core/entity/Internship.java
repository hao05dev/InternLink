package com.internlink.core.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "INTERNSHIP")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Internship {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID_INTERNSHIP")
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ID_SP", nullable = false)
    private Student student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ID_IP")
    private InternshipPosting internshipPosting;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ID_COMPANY", nullable = false)
    private Company company;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ID_LECTURER")
    private Lecturer lecturer; // Academic advisor

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ID_CM")
    private CompanyMentor companyMentor; // Industry supervisor

    @Column(name = "START_DATE")
    private LocalDate startDate;

    @Column(name = "END_DATE")
    private LocalDate endDate;

    @Builder.Default
    @Column(name = "STATUS", length = 30)
    private String status = "IN_PROGRESS"; // IN_PROGRESS, COMPLETED, SUSPENDED, TERMINATED

    @CreationTimestamp
    @Column(name = "CREATED_AT", updatable = false)
    private LocalDateTime createdAt;
}