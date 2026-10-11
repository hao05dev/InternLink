package com.internlink.core.application.recruitment.impl;

import com.internlink.core.application.recruitment.JobApplicationService;
import com.internlink.core.domain.auth.User;
import com.internlink.core.domain.organization.StudentRoster;
import com.internlink.core.domain.recruitment.JobApplication;
import com.internlink.core.domain.recruitment.JobPosition;
import com.internlink.core.domain.student.StudentProfile;
import com.internlink.core.domain.system.Document;
import com.internlink.core.infrastructure.persistence.jpa.JpaDocumentRepository;
import com.internlink.core.infrastructure.persistence.jpa.JpaJobApplicationRepository;
import com.internlink.core.infrastructure.persistence.jpa.JpaJobPositionRepository;
import com.internlink.core.infrastructure.persistence.jpa.JpaPlacementOfferRepository;
import com.internlink.core.infrastructure.persistence.jpa.JpaStudentProfileRepository;
import com.internlink.core.infrastructure.persistence.jpa.JpaStudentRosterRepository;
import com.internlink.core.infrastructure.persistence.jpa.JpaUserRepository;
import com.internlink.core.presentation.recruitment.dto.request.JobApplicationRequest;
import com.internlink.core.presentation.recruitment.dto.request.RecordInterviewResultRequest;
import com.internlink.core.presentation.recruitment.dto.request.ScheduleInterviewRequest;
import com.internlink.core.presentation.recruitment.dto.response.InterviewRoundDto;
import com.internlink.core.presentation.recruitment.dto.response.JobApplicationResponse;
import com.internlink.core.shared.enums.ApplicationStatus;
import com.internlink.core.shared.enums.DocumentType;
import com.internlink.core.shared.enums.EligibilityStatus;
import com.internlink.core.shared.enums.InterviewFormat;
import com.internlink.core.shared.enums.InterviewRoundResult;
import com.internlink.core.shared.enums.JobStatus;
import com.internlink.core.shared.enums.TermStatus;
import com.internlink.core.shared.enums.UserRole;
import com.internlink.core.shared.exception.BadRequestException;
import com.internlink.core.shared.exception.ResourceNotFoundException;
import com.internlink.core.shared.security.ResourceAuthorization;
import com.internlink.core.shared.security.SecurityGuard;
import com.internlink.core.shared.security.TermGuard;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class JobApplicationServiceImpl implements JobApplicationService {

    private final JpaJobApplicationRepository applicationRepository;
    private final JpaJobPositionRepository jobPositionRepository;
    private final JpaUserRepository userRepository;
    private final JpaDocumentRepository documentRepository;
    private final JpaStudentProfileRepository studentProfileRepository;
    private final JpaStudentRosterRepository studentRosterRepository;
    private final JpaPlacementOfferRepository offerRepository;
    private final SecurityGuard securityGuard;
    private final com.internlink.core.application.system.NotificationService notifications;

    /** Giới hạn số đơn ứng tuyển đang hoạt động trong một kỳ. */
    private static final int MAX_ACTIVE_APPLICATIONS_PER_TERM = 5;

    @Override
    @Transactional(readOnly = true)
    public List<JobApplicationResponse> getApplicationsByStudent(UUID studentId) {
        User actor = currentActor();
        ResourceAuthorization.require(ResourceAuthorization.isAdmin(actor) || actor.getId().equals(studentId));
        return applicationRepository.findByStudentId(studentId).stream()
            .map(this::mapToResponse)
            .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<JobApplicationResponse> getApplicationsByJob(UUID jobId) {
        JobPosition job = jobPositionRepository.findById(jobId)
            .orElseThrow(() -> new ResourceNotFoundException("JobPosition", "id", jobId));
        User actor = currentActor();
        ResourceAuthorization.require(ResourceAuthorization.representsCompany(actor, job.getCompany().getId())
            || ResourceAuthorization.managesDepartment(actor, job.getDepartment().getId()));
        return applicationRepository.findByJobId(jobId).stream()
            .map(this::mapToResponse)
            .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<JobApplicationResponse> getApplicationsForMyCompany() {
        User actor = currentActor();
        ResourceAuthorization.require(actor.getRole() == UserRole.COMPANY_REP && actor.getCompany() != null);
        return applicationRepository.findByJobCompanyId(actor.getCompany().getId()).stream()
            .map(this::mapToResponse)
            .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public JobApplicationResponse getApplicationById(UUID id) {
        JobApplication app = applicationRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("JobApplication", "id", id));
        ResourceAuthorization.require(ResourceAuthorization.canReadApplication(currentActor(), app));
        return mapToResponse(app);
    }

    @Override
    @Transactional
    public JobApplicationResponse applyJob(UUID studentId, JobApplicationRequest request) {
        User student = userRepository.findById(studentId)
            .orElseThrow(() -> new ResourceNotFoundException("User", "id", studentId));
        if (student.getRole() != UserRole.STUDENT) {
            throw new BadRequestException("Chỉ sinh viên mới được nộp hồ sơ ứng tuyển");
        }

        JobPosition job = jobPositionRepository.findById(request.getJobId())
            .orElseThrow(() -> new ResourceNotFoundException("JobPosition", "id", request.getJobId()));

        if (job.getStatus() != JobStatus.APPROVED || job.getClosedEarlyAt() != null) {
            throw new BadRequestException("Vị trí tuyển dụng chưa được Khoa phê duyệt hoặc đã đóng nhận hồ sơ");
        }

        OffsetDateTime now = OffsetDateTime.now();

        if (job.getApplicationDeadline() != null && now.isAfter(job.getApplicationDeadline())) {
            throw new BadRequestException(String.format(
                "Vị trí tuyển dụng '%s' đã hết hạn nộp hồ sơ vào lúc %s",
                job.getTitle(), job.getApplicationDeadline()
            ));
        }

        var term = job.getTerm();
        TermGuard.requireNotClosed(term);
        if (term.getStatus() != TermStatus.REGISTRATION_OPEN
            && term.getStatus() != TermStatus.APPLICATION_OPEN
            && term.getStatus() != TermStatus.ACTIVE) {
            throw new BadRequestException(String.format(
                "Kỳ thực tập '%s' hiện không tiếp nhận hồ sơ ứng tuyển (trạng thái: %s)",
                term.getCode(), term.getStatus()
            ));
        }

        StudentProfile studentProfile = studentProfileRepository.findByUserId(studentId)
            .orElseThrow(() -> new BadRequestException("Chưa có hồ sơ sinh viên. Vui lòng hoàn thiện hồ sơ trước khi ứng tuyển"));

        StudentRoster roster = studentRosterRepository
            .findByTermIdAndClaimedUserId(term.getId(), studentId)
            .orElseThrow(() -> new BadRequestException(String.format(
                "Sinh viên chưa được thêm vào danh sách kỳ thực tập '%s'. Liên hệ Khoa để cập nhật.",
                term.getCode()
            )));

        if (roster.getEligibilityStatus() != EligibilityStatus.ELIGIBLE) {
            throw new BadRequestException(String.format(
                "Sinh viên chưa đủ điều kiện tham gia kỳ thực tập '%s' (trạng thái: %s). %s",
                term.getCode(),
                roster.getEligibilityStatus(),
                roster.getEligibilityNote() != null ? roster.getEligibilityNote() : ""
            ));
        }

        List<String> targetProgramCodes = job.getTargetProgramCodes();
        if (targetProgramCodes != null && !targetProgramCodes.isEmpty()) {
            String studentProgramCode = studentProfile.getProgram().getCode();
            if (!targetProgramCodes.contains(studentProgramCode)) {
                throw new BadRequestException(String.format(
                    "Vị trí '%s' yêu cầu ngành %s, sinh viên thuộc ngành %s",
                    job.getTitle(), targetProgramCodes, studentProgramCode
                ));
            }
        }

        long activeCount = offerRepository.countReservedPlaces(job.getId(), now);
        if (activeCount >= job.getVacancies()) {
            throw new BadRequestException(String.format(
                "Vị trí '%s' đã đủ chỉ tiêu tuyển dụng (%d/%d)",
                job.getTitle(), activeCount, job.getVacancies()
            ));
        }

        if (applicationRepository.existsByJobIdAndStudentId(request.getJobId(), studentId)) {
            throw new BadRequestException("Bạn đã nộp hồ sơ ứng tuyển vào vị trí này rồi");
        }

        long activeAppsInTerm = applicationRepository
            .countActiveApplicationsByStudentInTerm(studentId, term.getId());
        if (activeAppsInTerm >= MAX_ACTIVE_APPLICATIONS_PER_TERM) {
            throw new BadRequestException(String.format(
                "Bạn đang có %d hồ sơ đang xử lý trong kỳ '%s' (tối đa %d). Rút bớt hồ sơ trước khi nộp thêm.",
                activeAppsInTerm, term.getCode(), MAX_ACTIVE_APPLICATIONS_PER_TERM
            ));
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
            .interviewRounds(List.of())
            .build();

        JobApplication saved = applicationRepository.save(application);
        notifyCompany(saved, "APPLICATION_SUBMITTED", "Hồ sơ ứng tuyển mới",
            student.getFullName() + " đã ứng tuyển vị trí " + job.getTitle());
        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public JobApplicationResponse updateApplicationStatus(UUID id, ApplicationStatus status) {
        JobApplication app = applicationRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("JobApplication", "id", id));
        TermGuard.requireNotClosed(app.getJob().getTerm());
        User actor = currentActor();
        ResourceAuthorization.require(ResourceAuthorization.isAdmin(actor)
            || ResourceAuthorization.representsCompany(actor, app.getJob().getCompany().getId()));

        if (!isValidTransition(app.getStatus(), status)) {
            throw new BadRequestException("Chuyển trạng thái hồ sơ không hợp lệ: " + app.getStatus() + " -> " + status);
        }

        app.setStatus(status);
        JobApplication saved = applicationRepository.save(app);
        notifications.sendNotification(saved.getStudent().getId(), "APPLICATION_STATUS_CHANGED", "Cập nhật hồ sơ ứng tuyển",
            "Hồ sơ vị trí " + saved.getJob().getTitle() + " chuyển sang " + status.name() + ".", "/student/applications");
        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public JobApplicationResponse scheduleInterview(UUID id, ScheduleInterviewRequest request) {
        JobApplication app = applicationRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("JobApplication", "id", id));
        TermGuard.requireNotClosed(app.getJob().getTerm());
        User actor = currentActor();
        ResourceAuthorization.require(ResourceAuthorization.isAdmin(actor)
            || ResourceAuthorization.representsCompany(actor, app.getJob().getCompany().getId()));

        if (app.getStatus() == ApplicationStatus.OFFERED
            || app.getStatus() == ApplicationStatus.REJECTED
            || app.getStatus() == ApplicationStatus.WITHDRAWN) {
            throw new BadRequestException("Không thể lên lịch phỏng vấn cho hồ sơ ở trạng thái " + app.getStatus());
        }

        if (request.getFormat() == InterviewFormat.ONLINE) {
            if (request.getMeetingUrl() == null || request.getMeetingUrl().isBlank()) {
                throw new BadRequestException("Phỏng vấn trực tuyến (Online) bắt buộc phải có liên kết phòng họp (Google Meet, MS Teams, Zoom)");
            }
        } else if (request.getFormat() == InterviewFormat.OFFLINE) {
            if (request.getLocation() == null || request.getLocation().isBlank()) {
                throw new BadRequestException("Phỏng vấn trực tiếp (Offline) bắt buộc phải có địa điểm");
            }
        }

        List<Map<String, Object>> rounds = new ArrayList<>(app.getInterviewRounds() != null ? app.getInterviewRounds() : List.of());
        int roundNum = request.getRoundNumber() != null ? request.getRoundNumber() : rounds.size() + 1;

        Map<String, Object> roundMap = new LinkedHashMap<>();
        roundMap.put("roundNumber", roundNum);
        roundMap.put("format", request.getFormat().name());
        roundMap.put("scheduledAt", request.getScheduledAt().toString());
        roundMap.put("meetingUrl", request.getMeetingUrl());
        roundMap.put("location", request.getLocation());
        roundMap.put("interviewer", request.getInterviewer());
        roundMap.put("notes", request.getNotes());
        roundMap.put("result", InterviewRoundResult.PENDING.name());
        roundMap.put("feedback", null);
        roundMap.put("scheduledBy", actor.getId().toString());
        roundMap.put("createdAt", OffsetDateTime.now().toString());

        rounds.add(roundMap);
        app.setInterviewRounds(rounds);
        app.setStatus(ApplicationStatus.INTERVIEWING);

        JobApplication saved = applicationRepository.save(app);

        String companyName = app.getJob().getCompany().getCompanyName();
        String jobTitle = app.getJob().getTitle();
        String timeStr = request.getScheduledAt().format(DateTimeFormatter.ofPattern("HH:mm dd/MM/yyyy"));
        String notifMsg = request.getFormat() == InterviewFormat.ONLINE
            ? String.format("Công ty %s mời bạn phỏng vấn Online vị trí '%s' vào lúc %s. Link phòng họp: %s", companyName, jobTitle, timeStr, request.getMeetingUrl())
            : String.format("Công ty %s mời bạn phỏng vấn vị trí '%s' vào lúc %s tại %s", companyName, jobTitle, timeStr, request.getLocation());

        notifications.sendNotification(
            saved.getStudent().getId(),
            "INTERVIEW_SCHEDULED",
            "Mời phỏng vấn: " + jobTitle,
            notifMsg,
            "/student/applications"
        );

        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public JobApplicationResponse recordInterviewResult(UUID id, int roundNumber, RecordInterviewResultRequest request) {
        JobApplication app = applicationRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("JobApplication", "id", id));
        TermGuard.requireNotClosed(app.getJob().getTerm());
        User actor = currentActor();
        ResourceAuthorization.require(ResourceAuthorization.isAdmin(actor)
            || ResourceAuthorization.representsCompany(actor, app.getJob().getCompany().getId()));

        List<Map<String, Object>> rounds = new ArrayList<>(app.getInterviewRounds() != null ? app.getInterviewRounds() : List.of());
        boolean found = false;
        for (Map<String, Object> round : rounds) {
            Object numObj = round.get("roundNumber");
            if (numObj != null && Integer.parseInt(numObj.toString()) == roundNumber) {
                round.put("result", request.getResult().name());
                round.put("feedback", request.getFeedback());
                round.put("recordedAt", OffsetDateTime.now().toString());
                found = true;
                break;
            }
        }

        if (!found) {
            throw new ResourceNotFoundException("InterviewRound", "roundNumber", roundNumber);
        }

        app.setInterviewRounds(rounds);
        if (request.getResult() == InterviewRoundResult.FAILED) {
            app.setStatus(ApplicationStatus.REJECTED);
        }

        JobApplication saved = applicationRepository.save(app);

        String resultText = request.getResult() == InterviewRoundResult.PASSED ? "ĐẠT" : "CHƯA PHÙ HỢP";
        notifications.sendNotification(
            saved.getStudent().getId(),
            "INTERVIEW_RESULT",
            "Kết quả phỏng vấn: " + saved.getJob().getTitle(),
            String.format("Kết quả vòng %d vị trí '%s': %s.", roundNumber, saved.getJob().getTitle(), resultText),
            "/student/applications"
        );

        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public JobApplicationResponse withdrawApplication(UUID id) {
        JobApplication app = applicationRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("JobApplication", "id", id));
        TermGuard.requireNotClosed(app.getJob().getTerm());
        User actor = currentActor();
        ResourceAuthorization.require(actor.getRole() == UserRole.STUDENT
            && actor.getId().equals(app.getStudent().getId()));
        if (app.getStatus() != ApplicationStatus.SUBMITTED
            && app.getStatus() != ApplicationStatus.REVIEWING
            && app.getStatus() != ApplicationStatus.INTERVIEWING) {
            throw new BadRequestException("Chỉ có thể rút hồ sơ trước khi nhận offer");
        }
        app.setStatus(ApplicationStatus.WITHDRAWN);
        JobApplication saved = applicationRepository.save(app);
        notifyCompany(saved, "APPLICATION_WITHDRAWN", "Sinh viên rút hồ sơ",
            saved.getStudent().getFullName() + " đã rút hồ sơ vị trí " + saved.getJob().getTitle());
        return mapToResponse(saved);
    }

    private void notifyCompany(JobApplication app, String type, String title, String message) {
        userRepository.findByCompanyIdAndRole(app.getJob().getCompany().getId(), UserRole.COMPANY_REP)
            .forEach(user -> notifications.sendNotification(user.getId(), type, title, message, "/company/candidates"));
    }

    private User currentActor() {
        UUID actorId = securityGuard.currentUser().getId();
        return userRepository.findById(actorId)
            .orElseThrow(() -> new ResourceNotFoundException("User", "id", actorId));
    }

    private boolean isValidTransition(ApplicationStatus current, ApplicationStatus next) {
        return switch (current) {
            case SUBMITTED -> next == ApplicationStatus.REVIEWING || next == ApplicationStatus.REJECTED;
            case REVIEWING -> next == ApplicationStatus.INTERVIEWING || next == ApplicationStatus.REJECTED;
            case INTERVIEWING -> next == ApplicationStatus.REJECTED;
            case OFFERED -> false;
            case REJECTED, WITHDRAWN -> false;
        };
    }

    private JobApplicationResponse mapToResponse(JobApplication entity) {
        List<InterviewRoundDto> roundDtos = new ArrayList<>();
        if (entity.getInterviewRounds() != null) {
            for (Map<String, Object> roundMap : entity.getInterviewRounds()) {
                try {
                    Integer roundNumber = roundMap.get("roundNumber") != null ? Integer.parseInt(roundMap.get("roundNumber").toString()) : null;
                    InterviewFormat format = roundMap.get("format") != null ? InterviewFormat.valueOf(roundMap.get("format").toString()) : null;
                    OffsetDateTime scheduledAt = roundMap.get("scheduledAt") != null ? OffsetDateTime.parse(roundMap.get("scheduledAt").toString()) : null;
                    String meetingUrl = Objects.toString(roundMap.get("meetingUrl"), null);
                    String location = Objects.toString(roundMap.get("location"), null);
                    String interviewer = Objects.toString(roundMap.get("interviewer"), null);
                    String notes = Objects.toString(roundMap.get("notes"), null);
                    InterviewRoundResult result = roundMap.get("result") != null ? InterviewRoundResult.valueOf(roundMap.get("result").toString()) : null;
                    String feedback = Objects.toString(roundMap.get("feedback"), null);
                    OffsetDateTime recordedAt = roundMap.get("recordedAt") != null ? OffsetDateTime.parse(roundMap.get("recordedAt").toString()) : null;

                    roundDtos.add(InterviewRoundDto.builder()
                        .roundNumber(roundNumber)
                        .format(format)
                        .scheduledAt(scheduledAt)
                        .meetingUrl(meetingUrl)
                        .location(location)
                        .interviewer(interviewer)
                        .notes(notes)
                        .result(result)
                        .feedback(feedback)
                        .recordedAt(recordedAt)
                        .build());
                } catch (Exception ignored) {
                }
            }
        }

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
            .interviewRounds(roundDtos)
            .status(entity.getStatus())
            .submittedAt(entity.getSubmittedAt())
            .updatedAt(entity.getUpdatedAt())
            .build();
    }
}
