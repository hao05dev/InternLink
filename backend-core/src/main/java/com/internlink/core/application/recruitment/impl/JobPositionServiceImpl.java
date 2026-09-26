package com.internlink.core.application.recruitment.impl;

import com.internlink.core.application.recruitment.JobPositionService;
import com.internlink.core.domain.auth.User;
import com.internlink.core.domain.company.Company;
import com.internlink.core.domain.organization.Department;
import com.internlink.core.domain.organization.InternshipTerm;
import com.internlink.core.domain.recruitment.JobPosition;
import com.internlink.core.infrastructure.persistence.jpa.*;
import com.internlink.core.presentation.recruitment.dto.request.JobPositionRequest;
import com.internlink.core.presentation.recruitment.dto.response.JobPositionResponse;
import com.internlink.core.shared.enums.JobStatus;
import com.internlink.core.shared.enums.VerificationStatus;
import com.internlink.core.shared.exception.BadRequestException;
import com.internlink.core.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class JobPositionServiceImpl implements JobPositionService {

    private final JpaJobPositionRepository jobPositionRepository;
    private final JpaCompanyRepository companyRepository;
    private final JpaInternshipTermRepository termRepository;
    private final JpaDepartmentRepository departmentRepository;
    private final JpaUserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public List<JobPositionResponse> getAllJobs() {
        return jobPositionRepository.findAll().stream()
            .map(this::mapToResponse)
            .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<JobPositionResponse> getJobsByCompany(UUID companyId) {
        return jobPositionRepository.findByCompanyId(companyId).stream()
            .map(this::mapToResponse)
            .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<JobPositionResponse> getJobsByTerm(UUID termId) {
        return jobPositionRepository.findByTermId(termId).stream()
            .map(this::mapToResponse)
            .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<JobPositionResponse> getApprovedJobs(UUID termId) {
        return jobPositionRepository.findByTermIdAndStatus(termId, JobStatus.APPROVED).stream()
            .map(this::mapToResponse)
            .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public JobPositionResponse getJobById(UUID id) {
        JobPosition job = jobPositionRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("JobPosition", "id", id));
        return mapToResponse(job);
    }

    @Override
    @Transactional
    public JobPositionResponse createJob(JobPositionRequest request, UUID createdByUserId) {
        Company company = companyRepository.findById(request.getCompanyId())
            .orElseThrow(() -> new ResourceNotFoundException("Company", "id", request.getCompanyId()));

        if (company.getVerificationStatus() != VerificationStatus.VERIFIED) {
            throw new BadRequestException("Doanh nghiệp chưa được xác thực, không thể đăng tin tuyển dụng");
        }

        InternshipTerm term = termRepository.findById(request.getTermId())
            .orElseThrow(() -> new ResourceNotFoundException("InternshipTerm", "id", request.getTermId()));

        Department department = departmentRepository.findById(request.getDepartmentId())
            .orElseThrow(() -> new ResourceNotFoundException("Department", "id", request.getDepartmentId()));

        if (!term.getDepartment().getId().equals(department.getId())) {
            throw new BadRequestException("Khoa thẩm định phải trùng với khoa quản lý kỳ thực tập");
        }

        // Track COMPANY_REP nao tao vi tri (phuc vu kiem tra quyen ky thoa thuan)
        User createdBy = userRepository.findById(createdByUserId)
            .orElseThrow(() -> new ResourceNotFoundException("User", "id", createdByUserId));

        JobPosition job = JobPosition.builder()
            .company(company)
            .term(term)
            .department(department)
            .title(request.getTitle().trim())
            .workFormat(request.getWorkFormat())
            .location(request.getLocation().trim())
            .vacancies(request.getVacancies())
            .description(request.getDescription().trim())
            .targetProgramCodes(request.getTargetProgramCodes() != null ? request.getTargetProgramCodes() : List.of())
            .targetLearningOutcomes(request.getTargetLearningOutcomes() != null ? request.getTargetLearningOutcomes() : List.of())
            .benefits(request.getBenefits() != null ? request.getBenefits() : List.of())
            .stipendAmount(request.getStipendAmount())
            .status(JobStatus.DRAFT)
            .createdBy(createdBy)
            .build();

        return mapToResponse(jobPositionRepository.save(job));
    }

    @Override
    @Transactional
    public JobPositionResponse updateJob(UUID id, JobPositionRequest request) {
        JobPosition job = jobPositionRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("JobPosition", "id", id));

        if (job.getStatus() != JobStatus.DRAFT && job.getStatus() != JobStatus.REJECTED) {
            throw new BadRequestException("Chỉ có thể chỉnh sửa vị trí ở trạng thái DRAFT hoặc REJECTED");
        }

        job.setTitle(request.getTitle().trim());
        job.setWorkFormat(request.getWorkFormat());
        job.setLocation(request.getLocation().trim());
        job.setVacancies(request.getVacancies());
        job.setDescription(request.getDescription().trim());
        job.setTargetProgramCodes(request.getTargetProgramCodes() != null ? request.getTargetProgramCodes() : List.of());
        job.setTargetLearningOutcomes(request.getTargetLearningOutcomes() != null ? request.getTargetLearningOutcomes() : List.of());
        job.setBenefits(request.getBenefits() != null ? request.getBenefits() : List.of());
        job.setStipendAmount(request.getStipendAmount());

        return mapToResponse(jobPositionRepository.save(job));
    }

    @Override
    @Transactional
    public JobPositionResponse reviewJob(UUID id, JobStatus status, String facultyFeedback, UUID approvedByUserId) {
        JobPosition job = jobPositionRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("JobPosition", "id", id));

        if (status != JobStatus.APPROVED && status != JobStatus.REJECTED) {
            throw new BadRequestException("Kết quả thẩm định chỉ có thể là APPROVED hoặc REJECTED");
        }

        User approver = userRepository.findById(approvedByUserId)
            .orElseThrow(() -> new ResourceNotFoundException("User", "id", approvedByUserId));

        job.setStatus(status);
        job.setFacultyFeedback(facultyFeedback);
        job.setApprovedBy(approver);
        job.setApprovedAt(OffsetDateTime.now());

        return mapToResponse(jobPositionRepository.save(job));
    }

    private JobPositionResponse mapToResponse(JobPosition entity) {
        return JobPositionResponse.builder()
            .id(entity.getId())
            .companyId(entity.getCompany().getId())
            .companyName(entity.getCompany().getCompanyName())
            .termId(entity.getTerm().getId())
            .termName(entity.getTerm().getTermName())
            .departmentId(entity.getDepartment().getId())
            .departmentName(entity.getDepartment().getName())
            .title(entity.getTitle())
            .workFormat(entity.getWorkFormat())
            .location(entity.getLocation())
            .vacancies(entity.getVacancies())
            .description(entity.getDescription())
            .targetProgramCodes(entity.getTargetProgramCodes())
            .targetLearningOutcomes(entity.getTargetLearningOutcomes())
            .benefits(entity.getBenefits())
            .stipendAmount(entity.getStipendAmount())
            .status(entity.getStatus())
            .facultyFeedback(entity.getFacultyFeedback())
            .approvedByUserId(entity.getApprovedBy() != null ? entity.getApprovedBy().getId() : null)
            .approvedAt(entity.getApprovedAt())
            .createdAt(entity.getCreatedAt())
            .build();
    }
}
