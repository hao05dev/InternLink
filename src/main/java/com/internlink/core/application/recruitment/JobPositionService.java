package com.internlink.core.application.recruitment;

import com.internlink.core.presentation.recruitment.dto.request.JobPositionRequest;
import com.internlink.core.presentation.recruitment.dto.response.JobPositionResponse;
import com.internlink.core.shared.enums.JobStatus;

import java.util.List;
import java.util.UUID;

public interface JobPositionService {
    List<JobPositionResponse> getAllJobs();
    List<JobPositionResponse> getAllJobs(String keyword, UUID termId, UUID companyId);
    List<JobPositionResponse> getJobsByCompany(UUID companyId);
    List<JobPositionResponse> getJobsByTerm(UUID termId);
    List<JobPositionResponse> getApprovedJobs(UUID termId);
    List<JobPositionResponse> getApprovedJobs(UUID termId, String keyword);
    List<JobPositionResponse> getPublicJobs(String keyword, UUID termId, UUID companyId);
    JobPositionResponse getPublicJobById(UUID id);
    JobPositionResponse getJobById(UUID id);
    JobPositionResponse createJob(JobPositionRequest request, UUID createdByUserId);
    JobPositionResponse updateJob(UUID id, JobPositionRequest request);
    JobPositionResponse submitJob(UUID id);
    JobPositionResponse reviewJob(UUID id, JobStatus status, String facultyFeedback, UUID approvedByUserId);
}
