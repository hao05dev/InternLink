package com.internlink.core.dto.term;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SupervisorAssignmentResponse {

    private Long id;
    private Long internshipTermId;
    private String termName;
    private Long studentProfileId;
    private String studentCode;
    private String studentName;
    private Long lecturerUserId;
    private String lecturerName;
    private LocalDate assignedDate;
    private String status;
}