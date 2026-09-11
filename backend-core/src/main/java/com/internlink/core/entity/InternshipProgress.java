package com.internlink.core.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "INTERNSHIP_PROGRESS")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InternshipProgress {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID_PROGRESS")
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ID_INTERNSHIP", nullable = false)
    private Internship internship;

    @Column(name = "TITLE", length = 200, nullable = false)
    private String title;

    @Column(name = "DESCRIPTION", columnDefinition = "TEXT")
    private String description;

    @Column(name = "PROGRESS_PERCENTAGE")
    private Double progressPercentage; // e.g., 25.0, 50.0, 100.0

    @Builder.Default
    @Column(name = "STATUS", length = 30)
    private String status = "SUBMITTED"; // SUBMITTED, APPROVED, REJECTED, REVISION_REQUESTED

    @UpdateTimestamp
    @Column(name = "UPDATED_AT")
    private LocalDateTime updatedAt;
}