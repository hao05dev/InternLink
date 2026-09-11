package com.internlink.core.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "COMMITTEE_MEMBER")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CommitteeMember {

    @EmbeddedId
    private CommitteeMemberId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("committeeId")
    @JoinColumn(name = "ID_COMMITTEE", nullable = false)
    private EvaluationCommittee committee;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("userId")
    @JoinColumn(name = "ID_USER", nullable = false)
    private User user;

    @Column(name = "ROLE", length = 50)
    private String role; // PRESIDENT, SECRETARY, REVIEWER, MEMBER
}