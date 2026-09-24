package com.internlink.core.application.organization.impl;

import com.internlink.core.application.organization.DepartmentService;
import com.internlink.core.domain.organization.Department;
import com.internlink.core.infrastructure.persistence.jpa.JpaDepartmentRepository;
import com.internlink.core.presentation.organization.dto.request.DepartmentRequest;
import com.internlink.core.presentation.organization.dto.response.DepartmentResponse;
import com.internlink.core.shared.exception.BadRequestException;
import com.internlink.core.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DepartmentServiceImpl implements DepartmentService {

    private final JpaDepartmentRepository departmentRepository;

    @Override
    @Transactional(readOnly = true)
    public List<DepartmentResponse> getAllDepartments() {
        return departmentRepository.findAll().stream()
            .map(this::mapToResponse)
            .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public DepartmentResponse getDepartmentById(UUID id) {
        Department department = departmentRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Department", "id", id));
        return mapToResponse(department);
    }

    @Override
    @Transactional
    public DepartmentResponse createDepartment(DepartmentRequest request) {
        if (departmentRepository.existsByCode(request.getCode().trim().toUpperCase())) {
            throw new BadRequestException("Mã khoa '" + request.getCode() + "' đã tồn tại trong hệ thống");
        }

        Department department = Department.builder()
            .code(request.getCode().trim().toUpperCase())
            .name(request.getName().trim())
            .contactEmail(request.getContactEmail().trim().toLowerCase())
            .isActive(request.getIsActive())
            .build();

        return mapToResponse(departmentRepository.save(department));
    }

    @Override
    @Transactional
    public DepartmentResponse updateDepartment(UUID id, DepartmentRequest request) {
        Department department = departmentRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Department", "id", id));

        String newCode = request.getCode().trim().toUpperCase();
        departmentRepository.findByCode(newCode)
            .filter(existing -> !existing.getId().equals(id))
            .ifPresent(existing -> {
                throw new BadRequestException("Mã khoa '" + newCode + "' đã được sử dụng bởi khoa khác");
            });

        department.setCode(newCode);
        department.setName(request.getName().trim());
        department.setContactEmail(request.getContactEmail().trim().toLowerCase());
        department.setIsActive(request.getIsActive());

        return mapToResponse(departmentRepository.save(department));
    }

    private DepartmentResponse mapToResponse(Department entity) {
        return DepartmentResponse.builder()
            .id(entity.getId())
            .code(entity.getCode())
            .name(entity.getName())
            .contactEmail(entity.getContactEmail())
            .isActive(entity.getIsActive())
            .createdAt(entity.getCreatedAt())
            .updatedAt(entity.getUpdatedAt())
            .build();
    }
}
