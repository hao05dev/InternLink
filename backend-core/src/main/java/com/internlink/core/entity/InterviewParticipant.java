package com.internlink.core.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "INTERVIEW_PARTICIPANT", uniqueConstraints = {
        @UniqueConstraint(name = "UQ_INTERVIEW_USER", columnNames = { "ID_INTERVIEW", "ID_USER" })
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InterviewParticipant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID_INTERVIEW_PART")
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ID_INTERVIEW", nullable = false)
    private Interview interview;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ID_USER", nullable = false)
    private User user;

    @Column(name = "PARTICIPANT_ROLE", length = 50)
    private String participantRole; // CANDIDATE, INTERVIEWER, OBSERVER

    @Column(name = "JOINED_AT")
    private LocalDateTime joinedAt;

    @Column(name = "LEFT_AT")
    private LocalDateTime leftAt;

    @Builder.Default
    @Column(name = "STATUS", length = 30)
    private String status = "INVITED"; // INVITED, ACCEPTED, DECLINED, ATTENDED
}