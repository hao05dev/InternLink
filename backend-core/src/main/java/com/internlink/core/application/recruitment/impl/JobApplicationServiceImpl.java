package com.internlink.core.application.recruitment.impl;

import com.internlink.core.application.recruitment.JobApplicationService;
import com.internlink.core.domain.auth.User;
import com.internlink.core.domain.recruitment.JobApplication;
import com.internlink.core.domain.recruitment.JobPosition;
import com.internlink.core.domain.system.Document;
import com.internlink.core.infrastructure.persistence.jpa.JpaDocumentRepository;
import com.internlink.core.infrastructure.persistence.jpa.JpaJobApplicationRepository;
import com.internlink.core.infrastructure.persistence.jpa.JpaJobPositionRepository;
import com.internlink.core.infrastructure.persistence.jpa.JpaUserRepository;
import com.internlink.core.presentation.recruitment.dto.request.JobApplicationRequest;
import com.internlink.core.presentation.recruitment.dto.response.JobApplicationResponse;
import com.internlink.core.shared.enums.ApplicationStatus;
import com.internlink.core.shared.enums.JobStatus;
import com.internlink.core.shared.enums.DocumentType;
import com.internlink.core.shared.enums.UserRole;
import com.internlink.core.shared.exception.BadRequestException;
import com.internlink.core.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class JobApplicationServiceImpl implements JobApplicationService {

    private final JpaJobApplicationRepository applicationRepository;
    private final JpaJobPositionRepository jobPositionRepository;
    private final JpaUserRepository userRepository;
    private final JpaDocumentRepository documentRepository;

    @Override
    @Transactional(readOnly = true)
    public List<JobApplicationResponse> getApplicationsByStudent(UUID studentId) {
        return applicationRepository.findByStudentId(studentId).stream()
            .map(this::mapToResponse)
            .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<JobApplicationResponse> getApplicationsByJob(UUID jobId) {
        return applicationRepository.findByJobId(jobId).stream()
            .map(this::mapToResponse)
            .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public JobApplicationResponse getApplicationById(UUID id) {
        JobApplication app = applicationRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("JobApplication", "id", id));
        return mapToResponse(app);
    }

    @Override
    @Transactional
    public JobApplicationResponse applyJob(UUID studentId, JobApplicationRequest request) {
        User student = userRepository.findById(studentId)
            .orElseThrow(() -> new ResourceNotFoundException("User", "id", studentId));

        if (student.getRole() != UserRole.STUDENT) {
            throw new BadRequestException("Chỉ sinh viên mới có thể nộp hồ sơ ứng tuyển");
        }

        JobPosition job = jobPositionRepository.findById(request.getJobId())
            .orElseThrow(() -> new ResourceNotFoundException("JobPosition", "id", request.getJobId()));

        if (job.getStatus() != JobStatus.APPROVED) {
            throw new BadRequestException("Vị trí thực tập chưa được phê duyệt hoặc đã đóng");
        }

        if (applicationRepository.existsByJobIdAndStudentId(request.getJobId(), studentId)) {
            throw new BadRequestException("Bạn đã nộp hồ sơ ứng tuyển vào vị trí này rồi");
        }

        Document cvDoc = documentRepository.findById(request.getSubmittedCvDocumentId())
            .orElseThrow(() -> new ResourceNotFoundException("Document", "id", request.getSubmittedCvDocumentId()));

        if (!cvDoc.getOwner().getId().equals(studentId) || cvDoc.getDocumentType() != DocumentType.CV) {
            throw new BadRequestException("Tài liệu nộp kèm phải là CV thuộc sở hữu của sinh viên");
        }

        JobApplication application = JobApplication.builder()
            .job(job)
            .student(student)
            .submittedCvDocument(cvDoc)
            .coverLetter(request.getCoverLetter())
            .status(ApplicationStatus.SUBMITTED)
            .interviewRounds(java.util.List.of())
            .build();

        return mapToResponse(applicationRepository.save(application));
    }

    @Override
    @Transactional
    public JobApplicationResponse updateApplicationStatus(UUID id, ApplicationStatus status) {
        JobApplication app = applicationRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("JobApplication", "id", id));

        if (!isValidTransition(app.getStatus(), status)) {
            throw new BadRequestException("Chuyển trạng thái hồ sơ không hợp lệ: " + app.getStatus() + " -> " + status);
        }

        app.setStatus(status);
        return mapToResponse(applicationRepository.save(app));
    }

    private boolean isValidTransition(ApplicationStatus current, ApplicationStatus next) {
        return switch (current) {
            case SUBMITTED -> next == ApplicationStatus.REVIEWING || next == ApplicationStatus.REJECTED
                || next == ApplicationStatus.WITHDRAWN;
            case REVIEWING -> next == ApplicationStatus.INTERVIEWING || next == ApplicationStatus.OFFERED
                || next == ApplicationStatus.REJECTED || next == ApplicationStatus.WITHDRAWN;
            case INTERVIEWING -> next == ApplicationStatus.OFFERED || next == ApplicationStatus.REJECTED
                || next == ApplicationStatus.WITHDRAWN;
            case OFFERED -> next == ApplicationStatus.REJECTED || next == ApplicationStatus.WITHDRAWN;
            case REJECTED, WITHDRAWN -> false;
        };
    }

    private JobApplicationResponse mapToResponse(JobApplication entity) {
        return JobApplicationResponse.builder()
            .id(entity.getId())
            .jobId(entity.getJob().getId())
            .jobTitle(entity.getJob().getTitle())
            .companyName(entity.getJob().getCompany().getCompanyName())
            .studentId(entity.getStudent().getId())
            .studentName(entity.getStudent().getFullName())
            .studentEmail(entity.getStudent().getEmail())
            .submittedCvDocumentId(entity.getSubmittedCvDocument().getId())
            .coverLetter(entity.getCoverLetter())
            .aiMatchDetail(entity.getAiMatchDetail())
            .status(entity.getStatus())
            .submittedAt(entity.getSubmittedAt())
            .updatedAt(entity.getUpdatedAt())
            .build();
    }
}
