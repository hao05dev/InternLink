package com.internlink.core.application.organization.impl;

import com.internlink.core.application.organization.AcademicProgramService;
import com.internlink.core.domain.organization.AcademicProgram;
import com.internlink.core.domain.organization.Department;
import com.internlink.core.infrastructure.persistence.jpa.JpaAcademicProgramRepository;
import com.internlink.core.infrastructure.persistence.jpa.JpaDepartmentRepository;
import com.internlink.core.presentation.organization.dto.request.AcademicProgramRequest;
import com.internlink.core.presentation.organization.dto.response.AcademicProgramResponse;
import com.internlink.core.shared.exception.BadRequestException;
import com.internlink.core.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AcademicProgramServiceImpl implements AcademicProgramService {

    private final JpaAcademicProgramRepository programRepository;
    private final JpaDepartmentRepository departmentRepository;

    @Override
    @Transactional(readOnly = true)
    public List<AcademicProgramResponse> getAllPrograms() {
        return programRepository.findAll().stream()
            .map(this::mapToResponse)
            .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<AcademicProgramResponse> getProgramsByDepartment(UUID departmentId) {
        return programRepository.findByDepartmentId(departmentId).stream()
            .map(this::mapToResponse)
            .toList();
    }

    @Override
    @Transactional
    public AcademicProgramResponse createProgram(AcademicProgramRequest request) {
        Department department = departmentRepository.findById(request.getDepartmentId())
            .orElseThrow(() -> new ResourceNotFoundException("Department", "id", request.getDepartmentId()));

        if (programRepository.existsByCode(request.getCode().trim().toUpperCase())) {
            throw new BadRequestException("Mã ngành '" + request.getCode() + "' đã tồn tại trong hệ thống");
        }
        if (!List.of("REGULAR", "CTCLC").contains(request.getTrack()))
            throw new BadRequestException("Loại chương trình chỉ có thể là REGULAR hoặc CTCLC");

        AcademicProgram program = AcademicProgram.builder()
            .department(department)
            .code(request.getCode().trim().toUpperCase())
            .name(request.getName().trim())
            .degreeLevel(request.getDegreeLevel())
            .track(request.getTrack())
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
            .track(entity.getTrack())
            .isActive(entity.getIsActive())
            .createdAt(entity.getCreatedAt())
            .build();
    }
}
