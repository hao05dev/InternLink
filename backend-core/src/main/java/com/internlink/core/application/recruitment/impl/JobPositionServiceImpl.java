package com.internlink.core.application.recruitment.impl;

import com.internlink.core.application.recruitment.JobPositionService;
import com.internlink.core.application.system.AuditLogService;
import com.internlink.core.application.system.NotificationService;
import com.internlink.core.domain.ai_matching.SkillTaxonomy;
import com.internlink.core.domain.auth.User;
import com.internlink.core.domain.company.Company;
import com.internlink.core.domain.organization.Department;
import com.internlink.core.domain.organization.InternshipTerm;
import com.internlink.core.domain.organization.StudentRoster;
import com.internlink.core.domain.recruitment.JobPosition;
import com.internlink.core.domain.recruitment.JobSkill;
import com.internlink.core.domain.recruitment.JobSkillId;
import com.internlink.core.infrastructure.persistence.jpa.*;
import com.internlink.core.presentation.recruitment.dto.request.JobPositionRequest;
import com.internlink.core.presentation.recruitment.dto.request.JobSkillRequest;
import com.internlink.core.presentation.recruitment.dto.response.JobPositionResponse;
import com.internlink.core.presentation.recruitment.dto.response.JobSkillResponse;
import com.internlink.core.shared.enums.EligibilityStatus;
import com.internlink.core.shared.enums.JobStatus;
import com.internlink.core.shared.enums.UserRole;
import com.internlink.core.shared.enums.RequirementType;
import com.internlink.core.shared.enums.VerificationStatus;
import com.internlink.core.shared.exception.BadRequestException;
import com.internlink.core.shared.exception.ResourceNotFoundException;
import com.internlink.core.shared.security.ResourceAuthorization;
import com.internlink.core.shared.security.SecurityGuard;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.ArrayList;
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
    private final AuditLogService auditLogService;
    private final JpaJobSkillRepository jobSkillRepository;
    private final JpaSkillTaxonomyRepository taxonomyRepository;
    private final SecurityGuard securityGuard;
    private final NotificationService notificationService;
    private final JpaStudentRosterRepository studentRosterRepository;

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
            .map(this::mapToResponse)
            .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<JobPositionResponse> getJobsByCompany(UUID companyId) {
        User actor = currentActor();
        return jobPositionRepository.searchJobs(null, null, companyId, null).stream()
            .filter(job -> canReadJob(actor, job))
            .map(this::mapToResponse)
            .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<JobPositionResponse> getJobsByTerm(UUID termId) {
        User actor = currentActor();
        return jobPositionRepository.searchJobs(null, termId, null, null).stream()
            .filter(job -> canReadJob(actor, job))
            .map(this::mapToResponse)
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
            .map(this::mapToResponse)
            .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<JobPositionResponse> getPublicJobs(String keyword, UUID termId, UUID companyId) {
        return jobPositionRepository.searchJobs(keyword, termId, companyId, JobStatus.APPROVED).stream()
            .map(this::mapToResponse)
            .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public JobPositionResponse getPublicJobById(UUID id) {
        JobPosition job = jobPositionRepository.findById(id)
            .filter(position -> position.getStatus() == JobStatus.APPROVED)
            .orElseThrow(() -> new ResourceNotFoundException("JobPosition", "id", id));
        return mapToResponse(job);
    }

    @Override
    @Transactional(readOnly = true)
    public JobPositionResponse getJobById(UUID id) {
        JobPosition job = jobPositionRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("JobPosition", "id", id));
        if (job.getStatus() != JobStatus.APPROVED) {
            ResourceAuthorization.require(canReadJob(currentActor(), job));
        }
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

        // Track COMPANY_REP nào tạo vị trí (phục vụ kiểm tra quyền ký thỏa thuận)
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
        saveJobSkills(savedJob, request);

        return mapToResponse(savedJob);
    }

    @Override
    @Transactional
    public JobPositionResponse updateJob(UUID id, JobPositionRequest request) {
        JobPosition job = jobPositionRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("JobPosition", "id", id));
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
        saveJobSkills(updatedJob, request);

        return mapToResponse(updatedJob);
    }

    @Override
    @Transactional
    public JobPositionResponse submitJob(UUID id) {
        JobPosition job = jobPositionRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("JobPosition", "id", id));
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
        if (status == JobStatus.REJECTED && (facultyFeedback == null || facultyFeedback.isBlank()))
            throw new BadRequestException("Cần nêu lý do từ chối tin tuyển dụng");
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
        if (status == JobStatus.APPROVED) {
            // 1. Thông báo cho người đại diện doanh nghiệp
            var companyReps = userRepository.findByCompanyIdAndRole(job.getCompany().getId(), UserRole.COMPANY_REP);
            for (var rep : companyReps) {
                notificationService.sendNotification(
                    rep.getId(),
                    "JOB_APPROVED",
                    "Tin tuyển dụng đã được duyệt",
                    "Vị trí \"" + job.getTitle() + "\" đã được Ban chủ nhiệm khoa phê duyệt và đăng tuyển.",
                    "/company/jobs"
                );
            }
            // 2. Thông báo cho sinh viên đủ điều kiện trong kỳ thực tập
            List<StudentRoster> rosters = studentRosterRepository.findByTermIdAndEligibilityStatus(job.getTerm().getId(), EligibilityStatus.ELIGIBLE);
            for (var roster : rosters) {
                if (roster.getClaimedUser() != null) {
                    notificationService.sendNotification(
                        roster.getClaimedUser().getId(),
                        "NEW_JOB_POSTED",
                        "Tin tuyển dụng mới: " + job.getTitle(),
                        "Doanh nghiệp " + job.getCompany().getCompanyName() + " vừa đăng tuyển vị trí " + job.getTitle() + ".",
                        "/jobs/" + job.getId()
                    );
                }
            }
        } else if (status == JobStatus.REJECTED) {
            var companyReps = userRepository.findByCompanyIdAndRole(job.getCompany().getId(), UserRole.COMPANY_REP);
            for (var rep : companyReps) {
                notificationService.sendNotification(
                    rep.getId(),
                    "JOB_REJECTED",
                    "Tin tuyển dụng không được duyệt",
                    "Vị trí \"" + job.getTitle() + "\" đã bị từ chối: " + facultyFeedback,
                    "/company/jobs"
                );
            }
        }

        return mapToResponse(saved);
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

    private void saveJobSkills(JobPosition job, JobPositionRequest request) {
        List<JobSkill> skillsToSave = new ArrayList<>();

        // 1. Lưu từ danh sách skills chi tiết nếu có
        if (request.getSkills() != null && !request.getSkills().isEmpty()) {
            for (JobSkillRequest skillReq : request.getSkills()) {
                if (skillReq == null || skillReq.getSkillId() == null || skillReq.getSkillId().isBlank()) {
                    throw new BadRequestException("Mã kỹ năng không được để trống");
                }
                SkillTaxonomy taxonomy = requireSkill(skillReq.getSkillId());
                JobSkill jobSkill = JobSkill.builder()
                    .id(new JobSkillId(job.getId(), taxonomy.getId()))
                    .job(job)
                    .skill(taxonomy)
                    .requirementType(skillReq.getRequirementType() != null ? skillReq.getRequirementType() : RequirementType.MANDATORY)
                    .requiredLevel(skillReq.getRequiredLevel())
                    .weight(skillReq.getWeight() != null ? skillReq.getWeight() : BigDecimal.ONE)
                    .build();
                skillsToSave.add(jobSkill);
            }
        }

        // 2. Lưu từ mandatorySkillIds nếu có
        if (request.getMandatorySkillIds() != null && !request.getMandatorySkillIds().isEmpty()) {
            for (String skillId : request.getMandatorySkillIds()) {
                if (skillsToSave.stream().noneMatch(s -> s.getId().getSkillId().equals(skillId))) {
                    SkillTaxonomy taxonomy = requireSkill(skillId);
                    JobSkill jobSkill = JobSkill.builder()
                        .id(new JobSkillId(job.getId(), taxonomy.getId()))
                        .job(job)
                        .skill(taxonomy)
                        .requirementType(RequirementType.MANDATORY)
                        .weight(BigDecimal.ONE)
                        .build();
                    skillsToSave.add(jobSkill);
                }
            }
        }

        // 3. Lưu từ optionalSkillIds nếu có
        if (request.getOptionalSkillIds() != null && !request.getOptionalSkillIds().isEmpty()) {
            for (String skillId : request.getOptionalSkillIds()) {
                if (skillsToSave.stream().noneMatch(s -> s.getId().getSkillId().equals(skillId))) {
                    SkillTaxonomy taxonomy = requireSkill(skillId);
                    JobSkill jobSkill = JobSkill.builder()
                        .id(new JobSkillId(job.getId(), taxonomy.getId()))
                        .job(job)
                        .skill(taxonomy)
                        .requirementType(RequirementType.OPTIONAL)
                        .weight(BigDecimal.valueOf(0.5))
                        .build();
                    skillsToSave.add(jobSkill);
                }
            }
        }

        if (!skillsToSave.isEmpty()) {
            jobSkillRepository.saveAll(skillsToSave);
        }
    }

    private SkillTaxonomy requireSkill(String skillId) {
        if (skillId == null || skillId.isBlank()) {
            throw new BadRequestException("Mã kỹ năng không được để trống");
        }
        return taxonomyRepository.findById(skillId)
            .orElseThrow(() -> new BadRequestException("Kỹ năng không tồn tại trong từ điển: " + skillId));
    }

    private JobPositionResponse mapToResponse(JobPosition entity) {
        List<JobSkill> jobSkills = jobSkillRepository.findByIdJobId(entity.getId());
        List<JobSkillResponse> skillResponses = jobSkills.stream()
            .map(js -> JobSkillResponse.builder()
                .skillId(js.getSkill().getId())
                .skillName(js.getSkill().getSkillName())
                .requirementType(js.getRequirementType())
                .requiredLevel(js.getRequiredLevel())
                .weight(js.getWeight())
                .build())
            .toList();

        List<String> mandatory = jobSkills.stream()
            .filter(js -> js.getRequirementType() == RequirementType.MANDATORY)
            .map(js -> js.getSkill().getId())
            .toList();

        List<String> optional = jobSkills.stream()
            .filter(js -> js.getRequirementType() == RequirementType.OPTIONAL)
            .map(js -> js.getSkill().getId())
            .toList();

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
            .skills(skillResponses)
            .mandatorySkillIds(mandatory)
            .optionalSkillIds(optional)
            .build();
    }
}
