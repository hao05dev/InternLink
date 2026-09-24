package com.internlink.core.application.organization;

import com.internlink.core.presentation.organization.dto.request.AcademicProgramRequest;
import com.internlink.core.presentation.organization.dto.response.AcademicProgramResponse;

import java.util.List;
import java.util.UUID;

public interface AcademicProgramService {
    List<AcademicProgramResponse> getAllPrograms();
    List<AcademicProgramResponse> getProgramsByDepartment(UUID departmentId);
    AcademicProgramResponse createProgram(AcademicProgramRequest request);
}
