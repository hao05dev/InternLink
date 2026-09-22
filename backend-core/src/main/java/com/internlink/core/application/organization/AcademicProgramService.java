package com.internlink.core.application.organization;

import com.internlink.core.domain.organization.AcademicProgram;
import com.internlink.core.domain.organization.AcademicProgramRepository;
import com.internlink.core.domain.organization.Department;
import com.internlink.core.domain.organization.DepartmentRepository;
import com.internlink.core.exception.BadRequestException;
import com.internlink.core.exception.ResourceNotFoundException;
import com.internlink.core.presentation.organization.dto.request.AcademicProgramRequest;
import com.internlink.core.presentation.organization.dto.response.AcademicProgramResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AcademicProgramService {

    private final AcademicProgramRepository programRepository;
    private final DepartmentRepository departmentRepository;

    @Transactional(readOnly = true)
    public List<AcademicProgramResponse> getAllPrograms() {
        return programRepository.findAll().stream()
            .map(this::mapToResponse)
            .toList();
    }

    @Transactional(readOnly = true)
    public List<AcademicProgramResponse> getProgramsByDepartment(UUID departmentId) {
        return programRepository.findByDepartmentId(departmentId).stream()
            .map(this::mapToResponse)
            .toList();
    }

    @Transactional
    public AcademicProgramResponse createProgram(AcademicProgramRequest request) {
        Department department = departmentRepository.findById(request.getDepartmentId())
            .orElseThrow(() -> new ResourceNotFoundException("Department", "id", request.getDepartmentId()));

        if (programRepository.existsByCode(request.getCode().trim().toUpperCase())) {
            throw new BadRequestException("Mã ngành '" + request.getCode() + "' đã tồn tại trong hệ thống");
        }

        AcademicProgram program = AcademicProgram.builder()
            .department(department)
            .code(request.getCode().trim().toUpperCase())
            .name(request.getName().trim())
            .degreeLevel(request.getDegreeLevel())
            .isActive(request.getIsActive())
            .build();

        return mapToResponse(programRepository.save(program));
    }

    private AcademicProgramResponse mapToResponse(AcademicProgram entity) {
        return AcademicProgramResponse.builder()
            .id(entity.getId())
            .departmentId(entity.getDepartment().getId())
            .departmentName(entity.getDepartment().getName())
            .code(entity.getCode())
            .name(entity.getName())
            .degreeLevel(entity.getDegreeLevel())
            .isActive(entity.getIsActive())
            .createdAt(entity.getCreatedAt())
            .build();
    }
}
