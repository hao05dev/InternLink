package com.internlink.core.application.recruitment.impl;

import com.internlink.core.application.recruitment.JobPositionService;
import com.internlink.core.application.system.AuditLogService;
import com.internlink.core.domain.auth.User;
import com.internlink.core.domain.company.Company;
import com.internlink.core.domain.organization.Department;
import com.internlink.core.domain.organization.InternshipTerm;
import com.internlink.core.domain.recruitment.JobPosition;
import com.internlink.core.infrastructure.persistence.jpa.*;
import com.internlink.core.presentation.recruitment.dto.request.JobPositionRequest;
import com.internlink.core.presentation.recruitment.dto.response.JobPositionResponse;
import com.internlink.core.shared.enums.JobStatus;
import com.internlink.core.shared.enums.RequirementType;
import com.internlink.core.shared.enums.UserRole;
import com.internlink.core.shared.enums.VerificationStatus;
import com.internlink.core.shared.exception.BadRequestException;
import com.internlink.core.shared.exception.ResourceNotFoundException;
import com.internlink.core.shared.security.ResourceAuthorization;
import com.internlink.core.shared.security.SecurityGuard;
import com.internlink.core.shared.security.TermGuard;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class JobPositionServiceImpl implements JobPositionService {

    private final JpaJobPositionRepository jobPositionRepository;
    private final JpaCompanyRepository companyRepository;
    private final JpaInternshipTermRepository termRepository;
    private final JpaDepartmentRepository departmentRepository;
    private final JpaUserRepository userRepository;
    private final JpaJobSkillRepository jobSkillRepository;
    private final AuditLogService auditLogService;
    private final SecurityGuard securityGuard;

    // Delegated helpers
    private final JobPositionMapper jobPositionMapper;
    private final JobSkillAssignmentHandler jobSkillAssignmentHandler;
    private final JobPositionNotificationHelper notificationHelper;

    @Override
    @Transactional(readOnly = true)
    public List<JobPositionResponse> getAllJobs() {
        return getAllJobs(null, null, null);
    }

    @Override
    @Transactional(readOnly = true)
    public List<JobPositionResponse> getAllJobs(String keyword, UUID termId, UUID companyId) {
        User actor = currentActor();
        return jobPositionRepository.searchJobs(keyword, termId, companyId, null).stream()
            .filter(job -> canReadJob(actor, job))
            .map(jobPositionMapper::toResponse)
            .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<JobPositionResponse> getJobsByCompany(UUID companyId) {
        User actor = currentActor();
        return jobPositionRepository.searchJobs(null, null, companyId, null).stream()
            .filter(job -> canReadJob(actor, job))
            .map(jobPositionMapper::toResponse)
            .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<JobPositionResponse> getJobsByTerm(UUID termId) {
        User actor = currentActor();
        return jobPositionRepository.searchJobs(null, termId, null, null).stream()
            .filter(job -> canReadJob(actor, job))
            .map(jobPositionMapper::toResponse)
            .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<JobPositionResponse> getApprovedJobs(UUID termId) {
        return getApprovedJobs(termId, null);
    }

    @Override
    @Transactional(readOnly = true)
    public List<JobPositionResponse> getApprovedJobs(UUID termId, String keyword) {
        return jobPositionRepository.searchJobs(keyword, termId, null, JobStatus.APPROVED).stream()
            .map(jobPositionMapper::toResponse)
            .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<JobPositionResponse> getPublicJobs(String keyword, UUID termId, UUID companyId) {
        return jobPositionRepository.searchJobs(keyword, termId, companyId, JobStatus.APPROVED).stream()
            .map(jobPositionMapper::toResponse)
            .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public JobPositionResponse getPublicJobById(UUID id) {
        JobPosition job = jobPositionRepository.findById(id)
            .filter(position -> position.getStatus() == JobStatus.APPROVED)
            .orElseThrow(() -> new ResourceNotFoundException("JobPosition", "id", id));
        return jobPositionMapper.toResponse(job);
    }

    @Override
    @Transactional(readOnly = true)
    public JobPositionResponse getJobById(UUID id) {
        JobPosition job = jobPositionRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("JobPosition", "id", id));
        if (job.getStatus() != JobStatus.APPROVED) {
            ResourceAuthorization.require(canReadJob(currentActor(), job));
        }
        return jobPositionMapper.toResponse(job);
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
        TermGuard.requireNotClosed(term);

        Department department = departmentRepository.findById(request.getDepartmentId())
            .orElseThrow(() -> new ResourceNotFoundException("Department", "id", request.getDepartmentId()));

        if (!term.getDepartment().getId().equals(department.getId())) {
            throw new BadRequestException("Khoa thẩm định phải trùng với khoa quản lý kỳ thực tập");
        }

        User createdBy = userRepository.findById(createdByUserId)
            .orElseThrow(() -> new ResourceNotFoundException("User", "id", createdByUserId));
        ResourceAuthorization.require(createdByUserId.equals(securityGuard.currentUser().getId())
            && (ResourceAuthorization.isAdmin(createdBy)
                || ResourceAuthorization.representsCompany(createdBy, company.getId())));

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

        JobPosition savedJob = jobPositionRepository.save(job);
        jobSkillAssignmentHandler.saveJobSkills(savedJob, request);

        return jobPositionMapper.toResponse(savedJob);
    }

    @Override
    @Transactional
    public JobPositionResponse updateJob(UUID id, JobPositionRequest request) {
        JobPosition job = jobPositionRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("JobPosition", "id", id));
        TermGuard.requireNotClosed(job.getTerm());
        User actor = currentActor();
        ResourceAuthorization.require(ResourceAuthorization.isAdmin(actor)
            || ResourceAuthorization.representsCompany(actor, job.getCompany().getId()));

        if (job.getStatus() != JobStatus.DRAFT && job.getStatus() != JobStatus.REJECTED) {
            throw new BadRequestException("Chỉ có thể chỉnh sửa vị trí ở trạng thái DRAFT hoặc REJECTED");
        }
        if (!job.getCompany().getId().equals(request.getCompanyId())
            || !job.getTerm().getId().equals(request.getTermId())
            || !job.getDepartment().getId().equals(request.getDepartmentId())) {
            throw new BadRequestException("Không thể đổi doanh nghiệp, kỳ hoặc khoa của vị trí đã tạo");
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

        JobPosition updatedJob = jobPositionRepository.save(job);

        // Cập nhật lại kỹ năng yêu cầu
        jobSkillRepository.deleteByIdJobId(id);
        jobSkillAssignmentHandler.saveJobSkills(updatedJob, request);

        return jobPositionMapper.toResponse(updatedJob);
    }

    @Override
    @Transactional
    public JobPositionResponse submitJob(UUID id) {
        JobPosition job = jobPositionRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("JobPosition", "id", id));
        TermGuard.requireNotClosed(job.getTerm());
        User actor = currentActor();
        ResourceAuthorization.require(ResourceAuthorization.isAdmin(actor)
            || ResourceAuthorization.representsCompany(actor, job.getCompany().getId()));
        if (job.getStatus() != JobStatus.DRAFT && job.getStatus() != JobStatus.REJECTED) {
            throw new BadRequestException("Chỉ có thể gửi duyệt vị trí DRAFT hoặc REJECTED");
        }
        if (jobSkillRepository.findByIdJobId(id).stream()
            .noneMatch(skill -> skill.getRequirementType() == RequirementType.MANDATORY)) {
            throw new BadRequestException("Vị trí cần ít nhất một kỹ năng bắt buộc trước khi gửi duyệt");
        }
        job.setStatus(JobStatus.PENDING_APPROVAL);
        return jobPositionMapper.toResponse(jobPositionRepository.save(job));
    }

    @Override
    @Transactional
    public JobPositionResponse reviewJob(UUID id, JobStatus status, String facultyFeedback, UUID approvedByUserId) {
        JobPosition job = jobPositionRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("JobPosition", "id", id));
        TermGuard.requireNotClosed(job.getTerm());

        if (status != JobStatus.APPROVED && status != JobStatus.REJECTED) {
            throw new BadRequestException("Kết quả thẩm định chỉ có thể là APPROVED hoặc REJECTED");
        }
        if (status == JobStatus.REJECTED && (facultyFeedback == null || facultyFeedback.isBlank())) {
            throw new BadRequestException("Cần nêu lý do từ chối tin tuyển dụng");
        }
        if (job.getStatus() != JobStatus.PENDING_APPROVAL) {
            throw new BadRequestException("Chỉ có thể thẩm định vị trí đã gửi duyệt");
        }

        User approver = userRepository.findById(approvedByUserId)
            .orElseThrow(() -> new ResourceNotFoundException("User", "id", approvedByUserId));
        ResourceAuthorization.require(approvedByUserId.equals(securityGuard.currentUser().getId())
            && approver.getRole() == UserRole.FACULTY_ADMIN
            && ResourceAuthorization.managesDepartment(approver, job.getDepartment().getId()));

        job.setStatus(status);
        job.setFacultyFeedback(facultyFeedback);
        job.setApprovedBy(approver);
        job.setApprovedAt(OffsetDateTime.now());

        JobPosition saved = jobPositionRepository.save(job);
        auditLogService.logAction(approvedByUserId, "REVIEW_JOB_POSITION", "JobPosition", saved.getId(),
            "SUCCESS", Map.of("status", status.name()), null);

        // Gửi thông báo
        notificationHelper.notifyReviewResult(job, status, facultyFeedback);

        return jobPositionMapper.toResponse(saved);
    }

    private User currentActor() {
        UUID actorId = securityGuard.currentUser().getId();
        return userRepository.findById(actorId)
            .orElseThrow(() -> new ResourceNotFoundException("User", "id", actorId));
    }

    private boolean canReadJob(User actor, JobPosition job) {
        return job.getStatus() == JobStatus.APPROVED || ResourceAuthorization.isAdmin(actor)
            || ResourceAuthorization.managesDepartment(actor, job.getDepartment().getId())
            || ResourceAuthorization.representsCompany(actor, job.getCompany().getId());
    }
}
