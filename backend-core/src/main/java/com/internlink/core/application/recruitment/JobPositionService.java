package com.internlink.core.application.recruitment;

import com.internlink.core.presentation.recruitment.dto.request.JobPositionRequest;
import com.internlink.core.presentation.recruitment.dto.response.JobPositionResponse;
import com.internlink.core.shared.enums.JobStatus;

import com.internlink.core.shared.api.PageParam;
import com.internlink.core.shared.api.PageResponse;
import com.internlink.core.shared.enums.WorkFormat;

import java.util.List;
import java.util.UUID;

public interface JobPositionService {
    List<JobPositionResponse> getAllJobs();
    List<JobPositionResponse> getAllJobs(String keyword, UUID termId, UUID companyId);
    List<JobPositionResponse> getAllJobs(String keyword, UUID termId, UUID companyId, JobStatus status, String location, WorkFormat workFormat);
    List<JobPositionResponse> getJobsByCompany(UUID companyId);
    List<JobPositionResponse> getJobsByTerm(UUID termId);
    List<JobPositionResponse> getApprovedJobs(UUID termId);
    List<JobPositionResponse> getApprovedJobs(UUID termId, String keyword);
    List<JobPositionResponse> getPublicJobs(String keyword, UUID termId, UUID companyId);
    List<JobPositionResponse> getPublicJobs(String keyword, UUID termId, UUID companyId, String location, WorkFormat workFormat);
    PageResponse<JobPositionResponse> getPublicJobsPage(String keyword, UUID termId, UUID companyId, String location, WorkFormat workFormat, PageParam pageParam);
    JobPositionResponse getPublicJobById(UUID id);
    JobPositionResponse getJobById(UUID id);
    JobPositionResponse createJob(JobPositionRequest request, UUID createdByUserId);
    JobPositionResponse updateJob(UUID id, JobPositionRequest request);
    JobPositionResponse submitJob(UUID id);
    JobPositionResponse closeJobEarly(UUID id);
    JobPositionResponse reviewJob(UUID id, JobStatus status, String facultyFeedback, UUID approvedByUserId);
}
