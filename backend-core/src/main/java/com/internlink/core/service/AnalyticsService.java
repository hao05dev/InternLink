package com.internlink.core.service;

import com.internlink.core.dto.analytics.AdminDashboardResponse;
import com.internlink.core.dto.analytics.StudentDashboardResponse;
import com.internlink.core.entity.*;
import com.internlink.core.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final StudentProfileRepository studentProfileRepository;
    private final CompanyRepository companyRepository;
    private final JobRepository jobRepository;
    private final ApplicationRepository applicationRepository;
    private final LearningAgreementRepository learningAgreementRepository;
    private final InternshipIncidentRepository incidentRepository;
    private final RubricCriteriaScoreRepository criteriaScoreRepository;
    private final LogbookRepository logbookRepository;
    private final RubricEvaluationRepository evaluationRepository;
    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    public AdminDashboardResponse getAdminDashboardMetrics() {
        long totalStudents = studentProfileRepository.count();
        long totalCompanies = companyRepository.count();
        long totalJobs = jobRepository.count();
        long totalApplications = applicationRepository.count();
        long totalAgreements = learningAgreementRepository.count();
        long totalIncidents = incidentRepository.count();

        // Tính tỷ lệ sinh viên có thỏa thuận thực tập
        double placementRate = 0.0;
        if (totalStudents > 0) {
            placementRate = BigDecimal.valueOf(((double) totalAgreements / totalStudents) * 100.0)
                    .setScale(1, RoundingMode.HALF_UP).doubleValue();
        }

        // Thống kê đơn ứng tuyển theo trạng thái
        List<Application> allApps = applicationRepository.findAll();
        Map<String, Long> appsByStatus = allApps.stream()
                .collect(Collectors.groupingBy(Application::getStatus, Collectors.counting()));

        // Điểm đánh giá bình quân theo từng tiêu chí NACE
        List<RubricCriteriaScore> allScores = criteriaScoreRepository.findAll();
        Map<String, Double> averageNaceScores = new HashMap<>();
        allScores.stream()
                .collect(Collectors.groupingBy(RubricCriteriaScore::getCompetencyCode,
                        Collectors.averagingDouble(RubricCriteriaScore::getScore)))
                .forEach((code, avg) -> averageNaceScores.put(code,
                        BigDecimal.valueOf(avg).setScale(2, RoundingMode.HALF_UP).doubleValue()));

        return AdminDashboardResponse.builder()
                .totalStudents(totalStudents)
                .totalCompanies(totalCompanies)
                .totalJobs(totalJobs)
                .totalApplications(totalApplications)
                .totalLearningAgreements(totalAgreements)
                .totalIncidentsReported(totalIncidents)
                .overallPlacementRate(placementRate)
                .applicationsByStatus(appsByStatus)
                .averageNaceScores(averageNaceScores)
                .build();
    }

    public StudentDashboardResponse getStudentDashboardMetrics(Long userId) {
        StudentProfile profile = studentProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("Hồ sơ sinh viên không tồn tại."));

        LearningAgreement agreement = learningAgreementRepository.findByStudentId(userId)
                .stream().findFirst().orElse(null);

        String companyName = "Chưa có";
        String mentorName = "Chưa có";
        String supervisorName = "Chưa có";
        int completedLogbooks = 0;
        double averageScore = 0.0;

        if (agreement != null) {
            User mentor = userRepository.findById(agreement.getCompanyMentorId()).orElse(null);
            User supervisor = userRepository.findById(agreement.getAcademicSupervisorId()).orElse(null);
            if (mentor != null)
                mentorName = mentor.getFullName();
            if (supervisor != null)
                supervisorName = supervisor.getFullName();

            completedLogbooks = (int) logbookRepository.findByLearningAgreementId(agreement.getId()).stream()
                    .filter(l -> "APPROVED".equalsIgnoreCase(l.getStatus()))
                    .count();

            List<RubricEvaluation> evals = evaluationRepository.findByLearningAgreementId(agreement.getId());
            if (!evals.isEmpty()) {
                double avg = evals.stream()
                        .filter(e -> e.getTotalScore() != null)
                        .mapToDouble(RubricEvaluation::getTotalScore)
                        .average()
                        .orElse(0.0);
                averageScore = BigDecimal.valueOf(avg).setScale(2, RoundingMode.HALF_UP).doubleValue();
            }
        }

        long unreadNotifications = notificationRepository.countByUserIdAndIsReadFalse(userId);

        return StudentDashboardResponse.builder()
                .studentProfileId(profile.getId())
                .studentCode(profile.getStudentCode())
                .internshipStatus(profile.getInternshipStatus())
                .activeAgreementId(agreement != null ? agreement.getId() : null)
                .companyName(companyName)
                .mentorName(mentorName)
                .supervisorName(supervisorName)
                .completedLogbooksCount(completedLogbooks)
                .averageEvaluationScore(averageScore)
                .unreadNotificationsCount(unreadNotifications)
                .build();
    }
}