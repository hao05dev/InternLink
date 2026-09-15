package com.internlink.core.service;

import com.internlink.core.dto.tracking.*;
import com.internlink.core.entity.*;
import com.internlink.core.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class InternshipTrackingService {

    private final LearningAgreementRepository agreementRepository;
    private final LogbookRepository logbookRepository;
    private final InternshipIncidentRepository incidentRepository;
    private final ApplicationRepository applicationRepository;
    private final StudentProfileRepository studentProfileRepository;

    // 1. Tạo thỏa thuận thực tập 3 bên
    @Transactional
    public LearningAgreementResponse createAgreement(Long studentUserId, CreateAgreementRequest request) {
        Application application = applicationRepository.findById(request.applicationId())
                .orElseThrow(() -> new IllegalArgumentException("Application not found."));

        if (!"ACCEPTED".equalsIgnoreCase(application.getStatus())) {
            throw new IllegalStateException("Cannot create Learning Agreement for an unaccepted application.");
        }

        LearningAgreement agreement = LearningAgreement.builder()
                .applicationId(application.getId())
                .studentId(studentUserId)
                .academicSupervisorId(request.academicSupervisorId())
                .companyMentorId(request.companyMentorId())
                .educationalObjectives(request.educationalObjectives())
                .detailedTasks(request.detailedTasks())
                .knowledgeSkillsToAcquire(request.knowledgeSkillsToAcquire())
                .workHoursPerWeek(request.workHoursPerWeek() != null ? request.workHoursPerWeek() : 40)
                .startDate(request.startDate())
                .endDate(request.endDate())
                .version(1)
                .status("PENDING_SIGNATURES")
                .build();

        return LearningAgreementResponse.fromEntity(agreementRepository.save(agreement));
    }

    // 2. Ký thỏa thuận thực tập (Chữ ký điện tử 3 bên)
    @Transactional
    public LearningAgreementResponse signAgreement(Long agreementId, Long userId, String userRole) {
        LearningAgreement agreement = agreementRepository.findById(agreementId)
                .orElseThrow(() -> new IllegalArgumentException("Agreement not found with ID: " + agreementId));

        LocalDateTime now = LocalDateTime.now();

        if ("STUDENT".equals(userRole) && agreement.getStudentId().equals(userId)) {
            agreement.setStudentSigned(true);
            agreement.setStudentSignedAt(now);
        } else if ("COMPANY_MENTOR".equals(userRole) || "COMPANY_REP".equals(userRole)) {
            agreement.setMentorSigned(true);
            agreement.setMentorSignedAt(now);
        } else if ("LECTURER".equals(userRole) || "FACULTY_ADMIN".equals(userRole)) {
            agreement.setSupervisorSigned(true);
            agreement.setSupervisorSignedAt(now);
        } else {
            throw new IllegalStateException("You are not authorized to sign this agreement.");
        }

        // Nếu cả 3 bên đã ký -> Kích hoạt trạng thái FULLY_SIGNED
        if (Boolean.TRUE.equals(agreement.getStudentSigned()) &&
                Boolean.TRUE.equals(agreement.getMentorSigned()) &&
                Boolean.TRUE.equals(agreement.getSupervisorSigned())) {
            agreement.setStatus("FULLY_SIGNED");
        }

        return LearningAgreementResponse.fromEntity(agreementRepository.save(agreement));
    }

    // 3. Sinh viên nộp nhật ký tuần (Logbook)
    @Transactional
    public LogbookResponse submitLogbook(Long studentUserId, LogbookRequest request) {
        LearningAgreement agreement = agreementRepository.findById(request.learningAgreementId())
                .orElseThrow(() -> new IllegalArgumentException("Agreement not found."));

        if (!agreement.getStudentId().equals(studentUserId)) {
            throw new IllegalStateException("You can only submit logbooks for your own agreement.");
        }

        Logbook logbook = logbookRepository
                .findByLearningAgreementIdAndWeekNumber(agreement.getId(), request.weekNumber())
                .orElse(Logbook.builder()
                        .learningAgreementId(agreement.getId())
                        .weekNumber(request.weekNumber())
                        .build());

        logbook.setStartDate(request.startDate());
        logbook.setEndDate(request.endDate());
        logbook.setTasksPerformed(request.tasksPerformed());
        logbook.setLearnedSkills(request.learnedSkills());
        logbook.setEvidenceUrl(request.evidenceUrl());
        logbook.setHoursLogged(request.hoursLogged() != null ? request.hoursLogged() : 40.0);
        logbook.setStatus("SUBMITTED");

        return LogbookResponse.fromEntity(logbookRepository.save(logbook));
    }

    // 4. Mentor doanh nghiệp duyệt & chấm điểm nhật ký tuần
    @Transactional
    public LogbookResponse reviewLogbookByMentor(Long logbookId, LogbookReviewRequest request) {
        Logbook logbook = logbookRepository.findById(logbookId)
                .orElseThrow(() -> new IllegalArgumentException("Logbook not found with ID: " + logbookId));

        logbook.setStatus(request.status().toUpperCase());
        logbook.setMentorFeedback(request.feedback());
        logbook.setMentorRating(request.rating());

        return LogbookResponse.fromEntity(logbookRepository.save(logbook));
    }

    // 5. Báo cáo sự cố thực tập (Incident)
    @Transactional
    public IncidentResponse reportIncident(Long userId, IncidentRequest request) {
        InternshipIncident incident = InternshipIncident.builder()
                .learningAgreementId(request.learningAgreementId())
                .reportedByUserId(userId)
                .incidentType(request.incidentType())
                .description(request.description())
                .studentEvidenceUrl(request.studentEvidenceUrl())
                .severity(request.severity() != null ? request.severity() : "MEDIUM")
                .resolutionStatus("OPEN")
                .build();

        return IncidentResponse.fromEntity(incidentRepository.save(incident));
    }
}