package com.internlink.core.service;

import com.internlink.core.dto.evaluation.*;
import com.internlink.core.entity.*;
import com.internlink.core.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class EvaluationService {

    private final RubricEvaluationRepository rubricEvaluationRepository;
    private final RubricCriteriaScoreRepository rubricCriteriaScoreRepository;
    private final NaceCompetencyRepository naceCompetencyRepository;
    private final SatisfactionSurveyRepository satisfactionSurveyRepository;
    private final InternshipAppealRepository internshipAppealRepository;
    private final LearningAgreementRepository learningAgreementRepository;
    private final UserRepository userRepository;

    public List<NaceCompetency> getAllNaceCompetencies() {
        return naceCompetencyRepository.findAll();
    }

    @Transactional
    public RubricEvaluationResponse createOrUpdateEvaluation(RubricEvaluationRequest request, Long currentUserId, Role currentUserRole) {
        LearningAgreement agreement = learningAgreementRepository.findById(request.getLearningAgreementId())
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy thỏa thuận thực tập với ID: " + request.getLearningAgreementId()));

        // Phân quyền đánh giá Rubric
        validateEvaluatorPermission(agreement, request.getEvaluatorRole(), currentUserId, currentUserRole);

        // Tính điểm trung bình tổng (thang điểm 10, làm tròn 2 chữ số thập phân)
        double averageScore = request.getCriteriaScores().stream()
                .mapToDouble(CriteriaScoreDto::getScore)
                .average()
                .orElse(0.0);
        double roundedTotalScore = BigDecimal.valueOf(averageScore).setScale(2, RoundingMode.HALF_UP).doubleValue();

        // Tìm phiếu đánh giá đã tồn tại hoặc tạo mới (Upsert)
        RubricEvaluation evaluation = rubricEvaluationRepository
                .findByLearningAgreementIdAndEvaluationTypeAndEvaluatorRoleAndEvaluatorUserId(
                        agreement.getId(),
                        request.getEvaluationType(),
                        request.getEvaluatorRole(),
                        currentUserId
                ).orElse(RubricEvaluation.builder()
                        .learningAgreementId(agreement.getId())
                        .evaluationType(request.getEvaluationType())
                        .evaluatorRole(request.getEvaluatorRole())
                        .evaluatorUserId(currentUserId)
                        .build());

        evaluation.setTotalScore(roundedTotalScore);
        evaluation.setStrengthsObserved(request.getStrengthsObserved());
        evaluation.setAreasForImprovement(request.getAreasForImprovement());
        evaluation.setFutureRecommendations(request.getFutureRecommendations());

        RubricEvaluation savedEvaluation = rubricEvaluationRepository.save(evaluation);

        // Lưu / cập nhật điểm tiêu chí chi tiết
        rubricCriteriaScoreRepository.deleteByEvaluationId(savedEvaluation.getId());
        List<RubricCriteriaScore> criteriaScores = request.getCriteriaScores().stream()
                .map(dto -> RubricCriteriaScore.builder()
                        .evaluationId(savedEvaluation.getId())
                        .competencyCode(dto.getCompetencyCode())
                        .score(dto.getScore())
                        .behavioralEvidence(dto.getBehavioralEvidence())
                        .build())
                .collect(Collectors.toList());
        rubricCriteriaScoreRepository.saveAll(criteriaScores);

        log.info("Saved Rubric Evaluation ID: {} for Agreement ID: {} by User ID: {}",
                savedEvaluation.getId(), agreement.getId(), currentUserId);

        return mapToEvaluationResponse(savedEvaluation, criteriaScores);
    }

    public List<RubricEvaluationResponse> getEvaluationsByAgreement(Long agreementId) {
        List<RubricEvaluation> evaluations = rubricEvaluationRepository.findByLearningAgreementId(agreementId);
        if (evaluations.isEmpty()) {
            return Collections.emptyList();
        }

        List<Long> evalIds = evaluations.stream().map(RubricEvaluation::getId).toList();
        List<RubricCriteriaScore> allScores = rubricCriteriaScoreRepository.findByEvaluationIdIn(evalIds);
        Map<Long, List<RubricCriteriaScore>> scoresByEvalId = allScores.stream()
                .collect(Collectors.groupingBy(RubricCriteriaScore::getEvaluationId));

        Map<String, String> competencyNameMap = naceCompetencyRepository.findAll().stream()
                .collect(Collectors.toMap(NaceCompetency::getCode, NaceCompetency::getName, (a, b) -> a));

        Map<Long, String> userNameMap = userRepository.findAllById(
                evaluations.stream().map(RubricEvaluation::getEvaluatorUserId).collect(Collectors.toSet())
        ).stream().collect(Collectors.toMap(User::getId, User::getFullName));

        return evaluations.stream().map(eval -> {
            List<RubricCriteriaScore> scores = scoresByEvalId.getOrDefault(eval.getId(), Collections.emptyList());
            List<CriteriaScoreDto> scoreDtos = scores.stream().map(s -> CriteriaScoreDto.builder()
                    .competencyCode(s.getCompetencyCode())
                    .competencyName(competencyNameMap.getOrDefault(s.getCompetencyCode(), s.getCompetencyCode()))
                    .score(s.getScore())
                    .behavioralEvidence(s.getBehavioralEvidence())
                    .build()).toList();

            return RubricEvaluationResponse.builder()
                    .id(eval.getId())
                    .learningAgreementId(eval.getLearningAgreementId())
                    .evaluationType(eval.getEvaluationType())
                    .evaluatorRole(eval.getEvaluatorRole())
                    .evaluatorUserId(eval.getEvaluatorUserId())
                    .evaluatorName(userNameMap.getOrDefault(eval.getEvaluatorUserId(), "N/A"))
                    .totalScore(eval.getTotalScore())
                    .strengthsObserved(eval.getStrengthsObserved())
                    .areasForImprovement(eval.getAreasForImprovement())
                    .futureRecommendations(eval.getFutureRecommendations())
                    .evaluatedAt(eval.getEvaluatedAt())
                    .criteriaScores(scoreDtos)
                    .build();
        }).toList();
    }

    // ==================== SATISFACTION SURVEY ====================

    @Transactional
    public SatisfactionSurveyResponse submitSatisfactionSurvey(SatisfactionSurveyRequest request, Long currentUserId) {
        LearningAgreement agreement = learningAgreementRepository.findById(request.getLearningAgreementId())
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy thỏa thuận thực tập với ID: " + request.getLearningAgreementId()));

        SatisfactionSurvey survey = satisfactionSurveyRepository
                .findByLearningAgreementIdAndSubmittedByUserId(agreement.getId(), currentUserId)
                .orElse(SatisfactionSurvey.builder()
                        .learningAgreementId(agreement.getId())
                        .submittedByUserId(currentUserId)
                        .build());

        survey.setTargetType(request.getTargetType());
        survey.setSatisfactionScore(request.getSatisfactionScore());
        survey.setWorkEnvironmentRating(request.getWorkEnvironmentRating());
        survey.setMentorSupportRating(request.getMentorSupportRating());
        survey.setWouldRecommend(request.getWouldRecommend());
        survey.setComments(request.getComments());

        SatisfactionSurvey saved = satisfactionSurveyRepository.save(survey);
        User user = userRepository.findById(currentUserId).orElse(null);

        return SatisfactionSurveyResponse.builder()
                .id(saved.getId())
                .learningAgreementId(saved.getLearningAgreementId())
                .submittedByUserId(saved.getSubmittedByUserId())
                .submittedByUserName(user != null ? user.getFullName() : "N/A")
                .targetType(saved.getTargetType())
                .satisfactionScore(saved.getSatisfactionScore())
                .workEnvironmentRating(saved.getWorkEnvironmentRating())
                .mentorSupportRating(saved.getMentorSupportRating())
                .wouldRecommend(saved.getWouldRecommend())
                .comments(saved.getComments())
                .createdAt(saved.getCreatedAt())
                .build();
    }

    public List<SatisfactionSurveyResponse> getSurveysByAgreement(Long agreementId) {
        List<SatisfactionSurvey> surveys = satisfactionSurveyRepository.findByLearningAgreementId(agreementId);
        if (surveys.isEmpty()) return Collections.emptyList();

        Map<Long, String> userNameMap = userRepository.findAllById(
                surveys.stream().map(SatisfactionSurvey::getSubmittedByUserId).collect(Collectors.toSet())
        ).stream().collect(Collectors.toMap(User::getId, User::getFullName));

        return surveys.stream().map(s -> SatisfactionSurveyResponse.builder()
                .id(s.getId())
                .learningAgreementId(s.getLearningAgreementId())
                .submittedByUserId(s.getSubmittedByUserId())
                .submittedByUserName(userNameMap.getOrDefault(s.getSubmittedByUserId(), "N/A"))
                .targetType(s.getTargetType())
                .satisfactionScore(s.getSatisfactionScore())
                .workEnvironmentRating(s.getWorkEnvironmentRating())
                .mentorSupportRating(s.getMentorSupportRating())
                .wouldRecommend(s.getWouldRecommend())
                .comments(s.getComments())
                .createdAt(s.getCreatedAt())
                .build()
        ).toList();
    }

    // ==================== INTERNSHIP APPEALS ====================

    @Transactional
    public InternshipAppealResponse createAppeal(InternshipAppealRequest request, Long currentUserId) {
        LearningAgreement agreement = learningAgreementRepository.findById(request.getLearningAgreementId())
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy thỏa thuận thực tập với ID: " + request.getLearningAgreementId()));

        if (!agreement.getStudentId().equals(currentUserId)) {
            throw new org.springframework.security.access.AccessDeniedException("Chỉ sinh viên thuộc thỏa thuận thực tập này mới có quyền gửi khiếu nại.");
        }

        InternshipAppeal appeal = InternshipAppeal.builder()
                .learningAgreementId(agreement.getId())
                .studentUserId(currentUserId)
                .appealType(request.getAppealType())
                .title(request.getTitle())
                .content(request.getContent())
                .evidenceUrl(request.getEvidenceUrl())
                .status("PENDING")
                .build();

        InternshipAppeal saved = internshipAppealRepository.save(appeal);
        User student = userRepository.findById(currentUserId).orElse(null);

        return mapToAppealResponse(saved, student != null ? student.getFullName() : "N/A", null);
    }

    @Transactional
    public InternshipAppealResponse resolveAppeal(Long appealId, AppealResolutionRequest request, Long handlerUserId) {
        InternshipAppeal appeal = internshipAppealRepository.findById(appealId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy khiếu nại với ID: " + appealId));

        appeal.setStatus(request.getStatus());
        appeal.setResponseContent(request.getResponseContent());
        appeal.setHandledByUserId(handlerUserId);
        appeal.setResolvedAt(LocalDateTime.now());

        InternshipAppeal saved = internshipAppealRepository.save(appeal);
        User student = userRepository.findById(saved.getStudentUserId()).orElse(null);
        User handler = userRepository.findById(handlerUserId).orElse(null);

        return mapToAppealResponse(saved, student != null ? student.getFullName() : "N/A", handler != null ? handler.getFullName() : "N/A");
    }

    public List<InternshipAppealResponse> getAppealsByAgreement(Long agreementId) {
        List<InternshipAppeal> appeals = internshipAppealRepository.findByLearningAgreementId(agreementId);
        if (appeals.isEmpty()) return Collections.emptyList();

        Set<Long> userIds = new HashSet<>();
        appeals.forEach(a -> {
            userIds.add(a.getStudentUserId());
            if (a.getHandledByUserId() != null) userIds.add(a.getHandledByUserId());
        });

        Map<Long, String> userNameMap = userRepository.findAllById(userIds).stream()
                .collect(Collectors.toMap(User::getId, User::getFullName));

        return appeals.stream().map(a -> mapToAppealResponse(
                a,
                userNameMap.getOrDefault(a.getStudentUserId(), "N/A"),
                a.getHandledByUserId() != null ? userNameMap.getOrDefault(a.getHandledByUserId(), "N/A") : null
        )).toList();
    }

    // ==================== HELPER METHODS ====================

    private void validateEvaluatorPermission(LearningAgreement agreement, String role, Long userId, Role userRole) {
        if (userRole == Role.ADMIN || userRole == Role.FACULTY_ADMIN) {
            return; // Quản trị viên có toàn quyền
        }

        switch (role) {
            case "STUDENT_SELF" -> {
                if (!agreement.getStudentId().equals(userId)) {
                    throw new org.springframework.security.access.AccessDeniedException("Bạn không phải sinh viên của thỏa thuận này.");
                }
            }
            case "COMPANY_MENTOR" -> {
                if (!agreement.getCompanyMentorId().equals(userId)) {
                    throw new org.springframework.security.access.AccessDeniedException("Bạn không phải Mentor doanh nghiệp hướng dẫn sinh viên này.");
                }
            }
            case "ACADEMIC_SUPERVISOR" -> {
                if (!agreement.getAcademicSupervisorId().equals(userId)) {
                    throw new org.springframework.security.access.AccessDeniedException("Bạn không phải Giảng viên hướng dẫn của sinh viên này.");
                }
            }
            case "COUNCIL_MEMBER" -> {
                if (userRole != Role.LECTURER && userRole != Role.FACULTY_ADMIN) {
                    throw new org.springframework.security.access.AccessDeniedException("Chỉ giảng viên hội đồng mới có quyền chấm điểm hội đồng.");
                }
            }
            default -> throw new IllegalArgumentException("Vai trò đánh giá không hợp lệ: " + role);
        }
    }

    private RubricEvaluationResponse mapToEvaluationResponse(RubricEvaluation evaluation, List<RubricCriteriaScore> scores) {
        Map<String, String> competencyNameMap = naceCompetencyRepository.findAll().stream()
                .collect(Collectors.toMap(NaceCompetency::getCode, NaceCompetency::getName, (a, b) -> a));

        User user = userRepository.findById(evaluation.getEvaluatorUserId()).orElse(null);

        List<CriteriaScoreDto> scoreDtos = scores.stream().map(s -> CriteriaScoreDto.builder()
                .competencyCode(s.getCompetencyCode())
                .competencyName(competencyNameMap.getOrDefault(s.getCompetencyCode(), s.getCompetencyCode()))
                .score(s.getScore())
                .behavioralEvidence(s.getBehavioralEvidence())
                .build()).toList();

        return RubricEvaluationResponse.builder()
                .id(evaluation.getId())
                .learningAgreementId(evaluation.getLearningAgreementId())
                .evaluationType(evaluation.getEvaluationType())
                .evaluatorRole(evaluation.getEvaluatorRole())
                .evaluatorUserId(evaluation.getEvaluatorUserId())
                .evaluatorName(user != null ? user.getFullName() : "N/A")
                .totalScore(evaluation.getTotalScore())
                .strengthsObserved(evaluation.getStrengthsObserved())
                .areasForImprovement(evaluation.getAreasForImprovement())
                .futureRecommendations(evaluation.getFutureRecommendations())
                .evaluatedAt(evaluation.getEvaluatedAt())
                .criteriaScores(scoreDtos)
                .build();
    }

    private InternshipAppealResponse mapToAppealResponse(InternshipAppeal appeal, String studentName, String handledByName) {
        return InternshipAppealResponse.builder()
                .id(appeal.getId())
                .learningAgreementId(appeal.getLearningAgreementId())
                .studentUserId(appeal.getStudentUserId())
                .studentName(studentName)
                .appealType(appeal.getAppealType())
                .title(appeal.getTitle())
                .content(appeal.getContent())
                .evidenceUrl(appeal.getEvidenceUrl())
                .status(appeal.getStatus())
                .responseContent(appeal.getResponseContent())
                .handledByUserId(appeal.getHandledByUserId())
                .handledByName(handledByName)
                .createdAt(appeal.getCreatedAt())
                .resolvedAt(appeal.getResolvedAt())
                .build();
    }
}
