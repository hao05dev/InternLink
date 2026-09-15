package com.internlink.core.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "interview_participants", uniqueConstraints = {
        @UniqueConstraint(name = "uq_interview_user", columnNames = { "interview_id", "user_id" })
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InterviewParticipant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "interview_id", nullable = false)
    private Long interviewId;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Builder.Default
    @Column(name = "participant_role", length = 50)
    private String participantRole = "INTERVIEWER"; // CANDIDATE, INTERVIEWER, MENTOR

    @Column(name = "joined_at")
    private LocalDateTime joinedAt;

    @Builder.Default
    @Column(name = "status", length = 30)
    private String status = "INVITED"; // INVITED, ACCEPTED, DECLINED, ATTENDED
}