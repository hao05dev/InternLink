package com.internlink.core.application.organization;

import com.internlink.core.common.enums.TermStatus;
import com.internlink.core.domain.organization.Department;
import com.internlink.core.domain.organization.DepartmentRepository;
import com.internlink.core.domain.organization.InternshipTerm;
import com.internlink.core.domain.organization.InternshipTermRepository;
import com.internlink.core.exception.BadRequestException;
import com.internlink.core.exception.ResourceNotFoundException;
import com.internlink.core.presentation.organization.dto.request.InternshipTermRequest;
import com.internlink.core.presentation.organization.dto.response.InternshipTermResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class InternshipTermService {

    private final InternshipTermRepository termRepository;
    private final DepartmentRepository departmentRepository;

    @Transactional(readOnly = true)
    public List<InternshipTermResponse> getTermsByDepartment(UUID departmentId) {
        return termRepository.findByDepartmentId(departmentId).stream()
            .map(this::mapToResponse)
            .toList();
    }

    @Transactional(readOnly = true)
    public InternshipTermResponse getTermById(UUID id) {
        InternshipTerm term = termRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("InternshipTerm", "id", id));
        return mapToResponse(term);
    }

    @Transactional
    public InternshipTermResponse createTerm(InternshipTermRequest request) {
        Department department = departmentRepository.findById(request.getDepartmentId())
            .orElseThrow(() -> new ResourceNotFoundException("Department", "id", request.getDepartmentId()));

        if (termRepository.existsByCode(request.getCode().trim().toUpperCase())) {
            throw new BadRequestException("Mã kỳ thực tập '" + request.getCode() + "' đã tồn tại");
        }

        if (request.getStartDate().isAfter(request.getEndDate())) {
            throw new BadRequestException("Ngày bắt đầu thực tập phải trước ngày kết thúc");
        }

        if (request.getRegistrationOpenAt().isAfter(request.getRegistrationCloseAt())) {
            throw new BadRequestException("Thời gian mở đăng ký phải trước thời gian đóng đăng ký");
        }

        InternshipTerm term = InternshipTerm.builder()
            .department(department)
            .code(request.getCode().trim().toUpperCase())
            .termName(request.getTermName().trim())
            .academicYear(request.getAcademicYear().trim())
            .semester(request.getSemester().trim())
            .registrationOpenAt(request.getRegistrationOpenAt())
            .registrationCloseAt(request.getRegistrationCloseAt())
            .startDate(request.getStartDate())
            .endDate(request.getEndDate())
            .applicationDeadline(request.getApplicationDeadline())
            .evaluationDeadline(request.getEvaluationDeadline())
            .status(request.getStatus() != null ? request.getStatus() : TermStatus.DRAFT)
            .settings(request.getSettings() != null ? request.getSettings() : Map.of())
            .build();

        return mapToResponse(termRepository.save(term));
    }

    @Transactional
    public InternshipTermResponse updateTermStatus(UUID termId, TermStatus newStatus) {
        InternshipTerm term = termRepository.findById(termId)
            .orElseThrow(() -> new ResourceNotFoundException("InternshipTerm", "id", termId));

        term.setStatus(newStatus);
        return mapToResponse(termRepository.save(term));
    }

    private InternshipTermResponse mapToResponse(InternshipTerm entity) {
        return InternshipTermResponse.builder()
            .id(entity.getId())
            .departmentId(entity.getDepartment().getId())
            .departmentName(entity.getDepartment().getName())
            .code(entity.getCode())
            .termName(entity.getTermName())
            .academicYear(entity.getAcademicYear())
            .semester(entity.getSemester())
            .registrationOpenAt(entity.getRegistrationOpenAt())
            .registrationCloseAt(entity.getRegistrationCloseAt())
            .startDate(entity.getStartDate())
            .endDate(entity.getEndDate())
            .applicationDeadline(entity.getApplicationDeadline())
            .evaluationDeadline(entity.getEvaluationDeadline())
            .status(entity.getStatus())
            .settings(entity.getSettings())
            .createdAt(entity.getCreatedAt())
            .build();
    }
}
