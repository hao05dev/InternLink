package com.internlink.core.application.recruitment;

import com.internlink.core.presentation.recruitment.dto.request.JobApplicationRequest;
import com.internlink.core.presentation.recruitment.dto.response.JobApplicationResponse;
import com.internlink.core.shared.enums.ApplicationStatus;

import java.util.List;
import java.util.UUID;

public interface JobApplicationService {
    List<JobApplicationResponse> getApplicationsByStudent(UUID studentId);
    List<JobApplicationResponse> getApplicationsByJob(UUID jobId);
    List<JobApplicationResponse> getApplicationsForMyCompany();
    JobApplicationResponse getApplicationById(UUID id);
    JobApplicationResponse applyJob(UUID studentId, JobApplicationRequest request);
    JobApplicationResponse updateApplicationStatus(UUID id, ApplicationStatus status);
    JobApplicationResponse withdrawApplication(UUID id);
}
