package com.internlink.core.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "INTERVIEW")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Interview {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID_INTERVIEW")
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ID_APPLICATION", nullable = false)
    private Application application;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ID_USER", nullable = false)
    private User creator; // The user who scheduled this interview

    @Column(name = "TITLE", length = 200, nullable = false)
    private String title;

    @Column(name = "INTERVIEW_TYPE", length = 50)
    private String interviewType; // ONLINE, OFFLINE, TECHNICAL, HR

    @Column(name = "SCHEDULED_START", nullable = false)
    private LocalDateTime scheduledStart;

    @Column(name = "SCHEDULED_END")
    private LocalDateTime scheduledEnd;

    @Column(name = "MEETING_URL", length = 500)
    private String meetingUrl; // e.g., Google Meet / Zoom link

    @Builder.Default
    @Column(name = "STATUS", length = 50)
    private String status = "SCHEDULED"; // SCHEDULED, IN_PROGRESS, COMPLETED, CANCELLED

    @CreationTimestamp
    @Column(name = "CREATED_AT", updatable = false)
    private LocalDateTime createdAt;
}