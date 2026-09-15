package com.internlink.core.service;

import com.internlink.core.dto.job.*;
import com.internlink.core.entity.*;
import com.internlink.core.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class JobService {

    private final JobRepository jobRepository;
    private final JobSkillRepository jobSkillRepository;
    private final CompanyRepository companyRepository;
    private final SkillRepository skillRepository;

    // 1. Doanh nghiệp đăng tin tuyển dụng mới
    @Transactional
    public JobResponse createJob(Long userId, JobRequest request) {
        Company company = companyRepository.findByCreatedByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException(
                        "You must create a verified Company profile before posting jobs."));

        if (!"VERIFIED".equalsIgnoreCase(company.getVerificationStatus())) {
            throw new IllegalStateException(
                    "Your company is pending verification by the Faculty. Cannot post jobs yet.");
        }

        Job job = Job.builder()
                .companyId(company.getId())
                .title(request.title())
                .description(request.description())
                .targetMajor(request.targetMajor())
                .locationRaw(request.locationRaw())
                .workFormat(request.workFormat() != null ? request.workFormat() : "ONSITE")
                .slots(request.slots() != null ? request.slots() : 1)
                .stipendRange(request.stipendRange())
                .benefits(request.benefits())
                .expectedLearningOutcomes(request.expectedLearningOutcomes())
                .status("PENDING_APPROVAL")
                .version(1)
                .build();

        Job savedJob = jobRepository.save(job);
        saveJobSkills(savedJob, request.skills());

        return buildJobResponse(savedJob, company.getName());
    }

    // 2. Doanh nghiệp xem danh sách tin của chính mình
    @Transactional(readOnly = true)
    public List<JobResponse> getMyCompanyJobs(Long userId) {
        Company company = companyRepository.findByCreatedByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("Company profile not found."));

        return jobRepository.findByCompanyId(company.getId()).stream()
                .map(job -> buildJobResponse(job, company.getName()))
                .toList();
    }

    // 3. Khoa xem danh sách tin đang chờ duyệt
    @Transactional(readOnly = true)
    public List<JobResponse> getPendingJobs() {
        return jobRepository.findByStatus("PENDING_APPROVAL").stream()
                .map(job -> {
                    String companyName = companyRepository.findById(job.getCompanyId())
                            .map(Company::getName).orElse("Unknown");
                    return buildJobResponse(job, companyName);
                }).toList();
    }

    // 4. Khoa phê duyệt hoặc từ chối tin tuyển dụng
    @Transactional
    public JobResponse reviewJob(Long jobId, Long facultyUserId, JobApprovalRequest request) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new IllegalArgumentException("Job not found with ID: " + jobId));

        job.setStatus(request.status().toUpperCase());
        job.setFacultyFeedback(request.feedback());
        job.setApprovedByUserId(facultyUserId);

        Job updatedJob = jobRepository.save(job);
        String companyName = companyRepository.findById(job.getCompanyId())
                .map(Company::getName).orElse("Unknown");

        return buildJobResponse(updatedJob, companyName);
    }

    // 5. Public / Sinh viên tra cứu danh sách tin tuyển dụng đã duyệt
    @Transactional(readOnly = true)
    public Page<JobResponse> searchJobs(String keyword, String major, Pageable pageable) {
        return jobRepository.searchApprovedJobs(keyword, major, pageable)
                .map(job -> {
                    String companyName = companyRepository.findById(job.getCompanyId())
                            .map(Company::getName).orElse("Unknown");
                    return buildJobResponse(job, companyName);
                });
    }

    // 6. Public / Sinh viên xem chi tiết 1 tin tuyển dụng
    @Transactional(readOnly = true)
    public JobResponse getJobDetail(Long jobId) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new IllegalArgumentException("Job not found with ID: " + jobId));

        String companyName = companyRepository.findById(job.getCompanyId())
                .map(Company::getName).orElse("Unknown");

        return buildJobResponse(job, companyName);
    }

    private void saveJobSkills(Job job, List<JobSkillDto> skillDtos) {
        if (skillDtos != null && !skillDtos.isEmpty()) {
            jobSkillRepository.deleteByIdJobId(job.getId());
            List<JobSkill> jobSkills = skillDtos.stream().map(dto -> {
                Skill masterSkill = skillRepository.findById(dto.skillId()).orElse(null);
                return JobSkill.builder()
                        .id(new JobSkillId(job.getId(), dto.skillId()))
                        .job(job)
                        .skill(masterSkill)
                        .isMandatory(dto.isMandatory() != null ? dto.isMandatory() : true)
                        .requiredLevel(dto.requiredLevel() != null ? dto.requiredLevel() : "INTERMEDIATE")
                        .build();
            }).toList();
            jobSkillRepository.saveAll(jobSkills);
        }
    }

    private JobResponse buildJobResponse(Job job, String companyName) {
        List<JobSkillDto> skills = jobSkillRepository.findByIdJobId(job.getId()).stream()
                .map(js -> new JobSkillDto(
                        js.getId().getSkillId(),
                        js.getSkill() != null ? js.getSkill().getName() : js.getId().getSkillId(),
                        js.getIsMandatory(),
                        js.getRequiredLevel()))
                .toList();

        return JobResponse.of(job, companyName, skills);
    }
}