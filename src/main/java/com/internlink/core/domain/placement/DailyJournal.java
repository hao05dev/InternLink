package com.internlink.core.domain.placement;

import com.internlink.core.shared.domain.BaseEntity;
import com.internlink.core.domain.auth.User;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.*;

@Entity @Table(name="daily_journals") @Getter @Setter @NoArgsConstructor
public class DailyJournal extends BaseEntity {
    @ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="placement_id",nullable=false) private InternshipPlacement placement;
    private LocalDate workDate;
    private String attendance;
    private LocalTime startTime;
    private LocalTime endTime;
    private Integer breakMinutes = 0;
    private Integer sessions = 0;
    private BigDecimal hours = BigDecimal.ZERO;
    @Column(columnDefinition="text") private String tasks = "";
    @Column(columnDefinition="text") private String results = "";
    @Column(columnDefinition="text") private String reflection = "";
    @Column(columnDefinition="text") private String evidence = "";
    private String status = "DRAFT";
    @Column(columnDefinition="text") private String reviewNote;
    @ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="reviewed_by") private User reviewedBy;
    private OffsetDateTime reviewedAt;
    private OffsetDateTime submittedAt;
}
