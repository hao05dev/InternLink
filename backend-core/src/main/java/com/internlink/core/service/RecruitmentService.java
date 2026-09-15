package com.internlink.core.service;

import com.internlink.core.dto.recruitment.*;
import com.internlink.core.entity.*;
import com.internlink.core.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class RecruitmentService {

    private final ApplicationRepository applicationRepository;
    private final InterviewRepository interviewRepository;
    private final InterviewParticipantRepository participantRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final JobRepository jobRepository;
    private final CompanyRepository companyRepository;
    private final UserRepository userRepository;
    private final MatchingResultRepository matchingResultRepository;

    // 1. Sinh viên nộp đơn ứng tuyển (Apply Job)
    @Transactional
    public ApplicationResponse applyJob(Long userId, ApplyJobRequest request) {
        StudentProfile student = studentProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Student profile not found. Please complete your profile first."));

        Job job = jobRepository.findById(request.jobId())
                .orElseThrow(() -> new IllegalArgumentException("Job not found with ID: " + request.jobId()));

        if (!"APPROVED".equalsIgnoreCase(job.getStatus())) {
            throw new IllegalStateException("This job is not open for applications.");
        }

        if (applicationRepository.existsByStudentProfileIdAndJobId(student.getId(), job.getId())) {
            throw new IllegalArgumentException("You have already applied for this job.");
        }

        // Lấy điểm AI Match score nếu đã tính toán trước đó
        Double aiScore = matchingResultRepository.findByJobIdAndStudentProfileId(job.getId(), student.getId())
                .map(MatchingResult::getMatchPercentage)
                .orElse(null);

        Application application = Application.builder()
                .studentProfileId(student.getId())
                .jobId(job.getId())
                .coverLetter(request.coverLetter())
                .aiMatchScore(aiScore)
                .status("APPLIED")
                .build();

        Application saved = applicationRepository.save(application);
        return buildApplicationResponse(saved, student, job);
    }

    // 2. Sinh viên xem danh sách các đơn đã nộp
    @Transactional(readOnly = true)
    public List<ApplicationResponse> getMyApplications(Long userId) {
        StudentProfile student = studentProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("Student profile not found."));

        return applicationRepository.findByStudentProfileIdOrderByAppliedAtDesc(student.getId()).stream()
                .map(app -> {
                    Job job = jobRepository.findById(app.getJobId()).orElse(null);
                    return buildApplicationResponse(app, student, job);
                }).toList();
    }

    // 3. Doanh nghiệp xem danh sách ứng viên nộp vào tin của mình
    @Transactional(readOnly = true)
    public List<ApplicationResponse> getJobApplications(Long jobId) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new IllegalArgumentException("Job not found with ID: " + jobId));

        return applicationRepository.findByJobIdOrderByAppliedAtDesc(jobId).stream()
                .map(app -> {
                    StudentProfile student = studentProfileRepository.findById(app.getStudentProfileId()).orElse(null);
                    return buildApplicationResponse(app, student, job);
                }).toList();
    }

    // 4. Doanh nghiệp lên lịch phỏng vấn
    @Transactional
    public InterviewResponse scheduleInterview(Long interviewerUserId, CreateInterviewRequest request) {
        Application application = applicationRepository.findById(request.applicationId())
                .orElseThrow(() -> new IllegalArgumentException(
                        "Application not found with ID: " + request.applicationId()));

        Interview interview = Interview.builder()
                .applicationId(application.getId())
                .createdByUserId(interviewerUserId)
                .title(request.title())
                .interviewType(request.interviewType() != null ? request.interviewType() : "ONLINE")
                .scheduledStart(request.scheduledStart())
                .scheduledEnd(request.scheduledEnd())
                .meetingUrl(request.meetingUrl())
                .locationDetails(request.locationDetails())
                .notes(request.notes())
                .status("SCHEDULED")
                .build();

        Interview savedInterview = interviewRepository.save(interview);

        // Cập nhật trạng thái Application
        application.setStatus("INTERVIEW_SCHEDULED");
        applicationRepository.save(application);

        // Thêm các Interviewer vào danh sách người tham gia
        if (request.interviewerUserIds() != null) {
            for (Long uid : request.interviewerUserIds()) {
                participantRepository.save(InterviewParticipant.builder()
                        .interviewId(savedInterview.getId())
                        .userId(uid)
                        .participantRole("INTERVIEWER")
                        .status("INVITED")
                        .build());
            }
        }

        return InterviewResponse.fromEntity(savedInterview);
    }

    // 5. Doanh nghiệp gửi Offer tuyển dụng
    @Transactional
    public ApplicationResponse sendOffer(Long applicationId, SendOfferRequest request) {
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new IllegalArgumentException("Application not found with ID: " + applicationId));

        application.setStatus("OFFERED");
        application.setOfferDetails(request.offerDetails());
        application.setOfferDeadline(request.offerDeadline());

        Application updated = applicationRepository.save(application);
        StudentProfile student = studentProfileRepository.findById(updated.getStudentProfileId()).orElse(null);
        Job job = jobRepository.findById(updated.getJobId()).orElse(null);

        return buildApplicationResponse(updated, student, job);
    }

    // 6. Sinh viên phản hồi Offer (Đồng ý hoặc Từ chối)
    @Transactional
    public ApplicationResponse respondToOffer(Long userId, Long applicationId, OfferDecisionRequest request) {
        StudentProfile student = studentProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("Student profile not found."));

        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new IllegalArgumentException("Application not found with ID: " + applicationId));

        if (!application.getStudentProfileId().equals(student.getId())) {
            throw new IllegalStateException("You are not authorized to respond to this application offer.");
        }

        String decision = request.decision().toUpperCase();
        if (!"ACCEPTED".equals(decision) && !"REJECTED".equals(decision)) {
            throw new IllegalArgumentException("Decision must be either ACCEPTED or REJECTED.");
        }

        application.setStatus(decision);
        application.setStudentDecisionAt(LocalDateTime.now());
        Application updated = applicationRepository.save(application);

        // Nếu sinh viên ACCEPTED -> Cập nhật trạng thái sinh viên sang
        // "OFFERED_ACCEPTED"
        if ("ACCEPTED".equals(decision)) {
            student.setInternshipStatus("LOOKING_FOR_AGREEMENT");
            studentProfileRepository.save(student);

            // Tăng số lượng đã tuyển trong Job
            Job job = jobRepository.findById(application.getJobId()).orElse(null);
            if (job != null) {
                job.setFilledSlots(job.getFilledSlots() + 1);
                jobRepository.save(job);
            }
        }

        Job job = jobRepository.findById(updated.getJobId()).orElse(null);
        return buildApplicationResponse(updated, student, job);
    }

    private ApplicationResponse buildApplicationResponse(Application app, StudentProfile student, Job job) {
        String studentName = "Unknown";
        String studentCode = student != null ? student.getStudentCode() : "Unknown";
        if (student != null) {
            studentName = userRepository.findById(student.getUserId()).map(User::getFullName).orElse("Unknown");
        }

        String jobTitle = job != null ? job.getTitle() : "Unknown";
        String companyName = "Unknown";
        if (job != null) {
            companyName = companyRepository.findById(job.getCompanyId()).map(Company::getName).orElse("Unknown");
        }

        return ApplicationResponse.of(app, studentName, studentCode, jobTitle, companyName);
    }
}