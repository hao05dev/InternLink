package com.internlink.core.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "REPORT")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Report {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID_REPORT")
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ID_INTERNSHIP", nullable = false)
    private Internship internship;

    @Column(name = "REPORT_TYPE", length = 50, nullable = false)
    private String reportType; // MID_TERM, FINAL_REPORT, COMPANY_CONFIRMATION

    @Column(name = "FILE_URL", length = 500, nullable = false)
    private String fileUrl;

    @CreationTimestamp
    @Column(name = "SUBMITTED_AT", updatable = false)
    private LocalDateTime submittedAt;

    @Builder.Default
    @Column(name = "STATUS", length = 30)
    private String status = "SUBMITTED"; // SUBMITTED, REVIEWED, ACCEPTED, REJECTED
}