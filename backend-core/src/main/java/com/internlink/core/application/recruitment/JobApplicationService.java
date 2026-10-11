package com.internlink.core.application.recruitment;

import com.internlink.core.presentation.recruitment.dto.request.JobApplicationRequest;
import com.internlink.core.presentation.recruitment.dto.request.RecordInterviewResultRequest;
import com.internlink.core.presentation.recruitment.dto.request.ScheduleInterviewRequest;
import com.internlink.core.presentation.recruitment.dto.response.JobApplicationResponse;
import com.internlink.core.shared.api.PageParam;
import com.internlink.core.shared.api.PageResponse;
import com.internlink.core.shared.enums.ApplicationStatus;

import java.util.List;
import java.util.UUID;

public interface JobApplicationService {
    List<JobApplicationResponse> getApplicationsByStudent(UUID studentId);
    PageResponse<JobApplicationResponse> getApplicationsByStudentPage(UUID studentId, PageParam pageParam);
    List<JobApplicationResponse> getApplicationsByJob(UUID jobId);
    PageResponse<JobApplicationResponse> getApplicationsByJobPage(UUID jobId, PageParam pageParam);
    List<JobApplicationResponse> getApplicationsForMyCompany();
    JobApplicationResponse getApplicationById(UUID id);
    JobApplicationResponse applyJob(UUID studentId, JobApplicationRequest request);
    JobApplicationResponse updateApplicationStatus(UUID id, ApplicationStatus status);
    JobApplicationResponse scheduleInterview(UUID id, ScheduleInterviewRequest request);
    JobApplicationResponse recordInterviewResult(UUID id, int roundNumber, RecordInterviewResultRequest request);
    JobApplicationResponse withdrawApplication(UUID id);
}
