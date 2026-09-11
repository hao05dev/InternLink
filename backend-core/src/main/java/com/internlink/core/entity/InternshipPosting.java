package com.internlink.core.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "INTERNSHIP_POSTING")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InternshipPosting {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID_IP")
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ID_COMPANY", nullable = false)
    private Company company;

    @Column(name = "TITLE", length = 250, nullable = false)
    private String title;

    @Column(name = "DESCRIPTION", columnDefinition = "TEXT")
    private String description;

    @Column(name = "LOCATION", length = 250)
    private String location;

    @Column(name = "INTERNSHIP_TYPE", length = 50)
    private String internshipType; // FULL_TIME, PART_TIME, REMOTE, HYBRID

    @Column(name = "SALARY_MIN")
    private Double salaryMin;

    @Column(name = "SALARY_MAX")
    private Double salaryMax;

    @Column(name = "START_DATE")
    private LocalDate startDate;

    @Column(name = "END_DATE")
    private LocalDate endDate;

    @Builder.Default
    @Column(name = "STATUS", length = 30)
    private String status = "OPEN"; // DRAFT, OPEN, CLOSED, FILLED

    @CreationTimestamp
    @Column(name = "CREATED_AT", updatable = false)
    private LocalDateTime createdAt;
}