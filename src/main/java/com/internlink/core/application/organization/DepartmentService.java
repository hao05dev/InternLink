package com.internlink.core.application.organization;

import com.internlink.core.presentation.organization.dto.request.DepartmentRequest;
import com.internlink.core.presentation.organization.dto.response.DepartmentResponse;

import java.util.List;
import java.util.UUID;

public interface DepartmentService {
    List<DepartmentResponse> getAllDepartments();
    DepartmentResponse getDepartmentById(UUID id);
    DepartmentResponse createDepartment(DepartmentRequest request);
    DepartmentResponse updateDepartment(UUID id, DepartmentRequest request);
}
