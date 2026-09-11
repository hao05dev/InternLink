package com.internlink.core.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "APPLICATION", uniqueConstraints = {
        @UniqueConstraint(name = "UQ_APPLICATION", columnNames = { "ID_SP", "ID_IP" })
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Application {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID_APPLICATION")
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ID_SP", nullable = false)
    private Student student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ID_IP", nullable = false)
    private InternshipPosting internshipPosting;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ID_CV")
    private CurriculumVitae curriculumVitae;

    @Column(name = "COVER_LETTER", columnDefinition = "TEXT")
    private String coverLetter;

    @Builder.Default
    @Column(name = "STATUS", length = 30)
    private String status = "PENDING"; // PENDING, REVIEWING, INTERVIEW_SCHEDULED, OFFERED, ACCEPTED, REJECTED

    @CreationTimestamp
    @Column(name = "APPLIED_AT", updatable = false)
    private LocalDateTime appliedAt;
}