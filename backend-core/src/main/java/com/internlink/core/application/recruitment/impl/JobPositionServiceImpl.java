package com.internlink.core.application.recruitment.impl;

import com.internlink.core.application.recruitment.JobPositionService;
import com.internlink.core.infrastructure.persistence.jpa.*;
import com.internlink.core.presentation.recruitment.dto.request.JobPositionRequest;
import com.internlink.core.presentation.recruitment.dto.response.JobPositionResponse;
import com.internlink.core.shared.api.PageParam;
import com.internlink.core.shared.api.PageResponse;
import com.internlink.core.shared.enums.JobStatus;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class JobPositionServiceImpl implements JobPositionService {
    private final JobPositionQueryService query;
    private final JobPositionWriteService write;
    private final JobPositionLifecycleService lifecycle;

    @Override
    public List<JobPositionResponse> getAllJobs() {
        return query.getAllJobs();
    }

    @Override
    public List<JobPositionResponse> getAllJobs(String keyword, UUID termId, UUID companyId) {
        return query.getAllJobs(keyword, termId, companyId);
    }

    @Override
    public List<JobPositionResponse> getAllJobs(
            String keyword, UUID termId, UUID companyId, com.internlink.core.shared.enums.JobStatus status, String location, com.internlink.core.shared.enums.WorkFormat workFormat
    ) {
        return query.getAllJobs(keyword, termId, companyId, status, location, workFormat);
    }

    @Override
    public List<JobPositionResponse> getJobsByCompany(UUID companyId) {
        return query.getJobsByCompany(companyId);
    }

    @Override
    public List<JobPositionResponse> getJobsByTerm(UUID termId) {
        return query.getJobsByTerm(termId);
    }

    @Override
    public List<JobPositionResponse> getApprovedJobs(UUID termId) {
        return query.getApprovedJobs(termId);
    }

    @Override
    public List<JobPositionResponse> getApprovedJobs(UUID termId, String keyword) {
        return query.getApprovedJobs(termId, keyword);
    }

    @Override
    public List<JobPositionResponse> getPublicJobs(String keyword, UUID termId, UUID companyId) {
        return query.getPublicJobs(keyword, termId, companyId);
    }

    @Override
    public List<JobPositionResponse> getPublicJobs(
            String keyword, UUID termId, UUID companyId, String location, com.internlink.core.shared.enums.WorkFormat workFormat
    ) {
        return query.getPublicJobs(keyword, termId, companyId, location, workFormat);
    }

    @Override
    public PageResponse<JobPositionResponse> getPublicJobsPage(
            String keyword, UUID termId, UUID companyId, String location, com.internlink.core.shared.enums.WorkFormat workFormat, PageParam pageParam
    ) {
        return query.getPublicJobsPage(keyword, termId, companyId, location, workFormat, pageParam);
    }

    @Override
    public JobPositionResponse getPublicJobById(UUID id) {
        return query.getPublicJobById(id);
    }

    @Override
    public JobPositionResponse getJobById(UUID id) {
        return query.getJobById(id);
    }

    @Override
    public JobPositionResponse createJob(JobPositionRequest request, UUID createdByUserId) {
        return write.createJob(request, createdByUserId);
    }

    @Override
    public JobPositionResponse updateJob(UUID id, JobPositionRequest request) {
        return write.updateJob(id, request);
    }

    @Override
    public JobPositionResponse submitJob(UUID id) {
        return lifecycle.submitJob(id);
    }

    @Override
    public JobPositionResponse closeJobEarly(UUID id) {
        return lifecycle.closeJobEarly(id);
    }

    @Override
    public JobPositionResponse reviewJob(
            UUID id, JobStatus status, String facultyFeedback, UUID approvedByUserId) {
        return lifecycle.reviewJob(id, status, facultyFeedback, approvedByUserId);
    }
}
