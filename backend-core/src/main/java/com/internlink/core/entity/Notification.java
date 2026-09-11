package com.internlink.core.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "NOTIFICATION")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID_NOTIFICATION")
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ID_USER", nullable = false)
    private User user;

    @Column(name = "TITLE", length = 200, nullable = false)
    private String title;

    @Column(name = "CONTENT", columnDefinition = "TEXT", nullable = false)
    private String content;

    @Column(name = "TYPE", length = 50)
    private String type; // APPLICATION_UPDATE, INTERVIEW_INVITATION, LOGBOOK_APPROVED,
                         // EVALUATION_PUBLISHED

    @Builder.Default
    @Column(name = "IS_READ")
    private Boolean isRead = false;

    @CreationTimestamp
    @Column(name = "CREATED_AT", updatable = false)
    private LocalDateTime createdAt;
}