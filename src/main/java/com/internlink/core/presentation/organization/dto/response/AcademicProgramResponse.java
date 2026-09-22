package com.internlink.core.presentation.organization.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.OffsetDateTime;
import java.util.UUID;



@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AcademicProgramResponse {

    private UUID id;
    private UUID departmentId;
    private String departmentName;
    private String code;
    private String name;
    private String degreeLevel;
    private Boolean isActive;
    private OffsetDateTime createdAt;
}