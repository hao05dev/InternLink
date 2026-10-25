package com.internlink.core.presentation.organization.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FacultyLecturerResponse {
    private UUID id;
    private String fullName;
    private String email;
    private String phoneNumber;
    private String departmentName;
    private String title;
    private Integer maxStudents;
    private Integer assignedCount;
}
