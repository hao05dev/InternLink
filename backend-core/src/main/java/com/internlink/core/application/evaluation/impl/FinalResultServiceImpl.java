package com.internlink.core.application.evaluation.impl;

import com.internlink.core.application.evaluation.CtuGradingHelper;
import com.internlink.core.application.evaluation.FinalResultService;
import com.internlink.core.application.system.AuditLogService;
import com.internlink.core.application.system.NotificationService;
import com.internlink.core.domain.auth.User;
import com.internlink.core.domain.evaluation.FinalResult;
import com.internlink.core.domain.evaluation.RubricEvaluation;
import com.internlink.core.domain.placement.InternshipPlacement;
import com.internlink.core.domain.student.StudentProfile;
import com.internlink.core.infrastructure.persistence.jpa.*;
import com.internlink.core.presentation.evaluation.dto.request.FinalResultRequest;
import com.internlink.core.presentation.evaluation.dto.response.FinalResultResponse;
import com.internlink.core.shared.enums.PlacementStatus;
import com.internlink.core.shared.enums.ResultStatus;
import com.internlink.core.shared.enums.UserRole;
import com.internlink.core.shared.exception.BadRequestException;
import com.internlink.core.shared.exception.ResourceNotFoundException;
import com.internlink.core.shared.security.SecurityGuard;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.OffsetDateTime;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class FinalResultServiceImpl implements FinalResultService {

    private final JpaFinalResultRepository finalResultRepository;
    private final JpaInternshipPlacementRepository placementRepository;
    private final JpaUserRepository userRepository;
    private final JpaStudentProfileRepository studentProfileRepository;
    private final JpaRubricEvaluationRepository rubricRepository;
    private final SecurityGuard securityGuard;
    private final AuditLogService auditLogService;
    private final NotificationService notificationService;

    /**
     * Xem kết quả có kiểm tra quyền:
     * - Sinh viên: chỉ xem kết quả của chính mình VÀ chỉ khi kết quả đã được công bố chính thức.
     * - Giảng viên / Mentor / Admin: được xem kết quả ở cả giai đoạn DRAFT để rà soát.
     */
    @Override
    @Transactional(readOnly = true)
    public FinalResultResponse getFinalResultByPlacement(UUID placementId, UUID requestingUserId) {
        FinalResult result = finalResultRepository.findByPlacementId(placementId)
            .orElseThrow(() -> new ResourceNotFoundException("FinalResult", "placementId", placementId));

        User requestingUser = userRepository.findById(requestingUserId)
            .orElseThrow(() -> new ResourceNotFoundException("User", "id", requestingUserId));

        if (requestingUser.getRole() == UserRole.STUDENT) {
            // Anti-IDOR: sinh viên chỉ xem điểm của chính mình
            securityGuard.requireSelf(requestingUserId, result.getPlacement().getStudent().getId(), "FinalResult");

            // Kiểm tra trạng thái công bố: nếu chưa công bố thì từ chối cho xem điểm chi tiết
            if (result.getPublishedAt() == null) {
                throw new BadRequestException("Kết quả thực tập của bạn đang được Hội đồng xét duyệt, chưa được công bố chính thức.");
            }
        }

        return mapToResponse(result);
    }

    @Override
    @Transactional(readOnly = true)
    public FinalResultResponse getFinalResultByPlacement(UUID placementId) {
        FinalResult result = finalResultRepository.findByPlacementId(placementId)
            .orElseThrow(() -> new ResourceNotFoundException("FinalResult", "placementId", placementId));
        return mapToResponse(result);
    }

    /**
     * Tính toán và tổng hợp điểm tổng kết:
     * 1. Tự động thu thập điểm từ các phiếu Rubric đã nộp (status = 'SUBMITTED') của Mentor và Giảng viên.
     * 2. Áp dụng trọng số linh hoạt (mặc định: 40% Mentor + 40% GVHD + 20% Tuân thủ).
     * 3. Tự động quy đổi sang thang điểm 4 và điểm chữ theo Quy chế đào tạo Đại học Cần Thơ (CTU).
     * 4. Hỗ trợ lưu nháp (DRAFT) để Hội đồng khoa rà soát, hoặc công bố ngay nếu chỉ định.
     */
    @Override
    @Transactional
    public FinalResultResponse calculateAndFinalizeResult(UUID decidedByUserId, FinalResultRequest request) {
        InternshipPlacement placement = placementRepository.findById(request.getPlacementId())
            .orElseThrow(() -> new ResourceNotFoundException("InternshipPlacement", "id", request.getPlacementId()));

        User admin = userRepository.findById(decidedByUserId)
            .orElseThrow(() -> new ResourceNotFoundException("User", "id", decidedByUserId));

        // ── 1. Tổng hợp điểm từ phiếu Rubric nếu autoAggregateFromRubrics = true ──
        BigDecimal mentorScore = request.getMentorScore();
        BigDecimal lecturerScore = request.getLecturerScore();
        BigDecimal complianceScore = request.getComplianceScore() != null ? request.getComplianceScore() : BigDecimal.valueOf(10.0);

        List<RubricEvaluation> submittedRubrics = rubricRepository.findByPlacementId(request.getPlacementId()).stream()
            .filter(r -> "SUBMITTED".equalsIgnoreCase(r.getStatus()))
            .toList();

        Optional<RubricEvaluation> mentorRubric = submittedRubrics.stream()
            .filter(r -> r.getEvaluatorRole() == UserRole.COMPANY_MENTOR ||
                         (placement.getMentor() != null && r.getEvaluator().getId().equals(placement.getMentor().getId())))
            .findFirst();

        Optional<RubricEvaluation> lecturerRubric = submittedRubrics.stream()
            .filter(r -> r.getEvaluatorRole() == UserRole.LECTURER ||
                         (placement.getLecturer() != null && r.getEvaluator().getId().equals(placement.getLecturer().getId())))
            .findFirst();

        if (Boolean.TRUE.equals(request.getAutoAggregateFromRubrics())) {
            if (mentorScore == null && mentorRubric.isPresent()) {
                mentorScore = mentorRubric.get().getFinalScore();
            }
            if (lecturerScore == null && lecturerRubric.isPresent()) {
                lecturerScore = lecturerRubric.get().getFinalScore();
            }
        }

        // Kiểm tra xem đã có ít nhất một nguồn điểm thành phần chưa
        if (mentorScore == null && lecturerScore == null) {
            throw new BadRequestException("Chưa có phiếu đánh giá Rubric nào được nộp cho lần thực tập này. " +
                    "Cần có ít nhất đánh giá từ Mentor doanh nghiệp hoặc Giảng viên hướng dẫn trước khi tổng hợp điểm.");
        }

        BigDecimal effectiveMentor = mentorScore != null ? mentorScore : BigDecimal.ZERO;
        BigDecimal effectiveLecturer = lecturerScore != null ? lecturerScore : BigDecimal.ZERO;

        // ── 2. Áp dụng trọng số tính điểm tổng kết thang 10 ──
        BigDecimal wMentor = request.getMentorWeight() != null ? request.getMentorWeight() : BigDecimal.valueOf(0.40);
        BigDecimal wLecturer = request.getLecturerWeight() != null ? request.getLecturerWeight() : BigDecimal.valueOf(0.40);
        BigDecimal wCompliance = request.getComplianceWeight() != null ? request.getComplianceWeight() : BigDecimal.valueOf(0.20);

        BigDecimal total10 = effectiveMentor.multiply(wMentor)
            .add(effectiveLecturer.multiply(wLecturer))
            .add(complianceScore.multiply(wCompliance))
            .setScale(2, RoundingMode.HALF_UP);

        // ── 3. Quy đổi theo thang điểm Đại học Cần Thơ (CTU) ──
        CtuGradingHelper.CtuGrade ctuGrade = CtuGradingHelper.convertFromScale10(total10);

        ResultStatus resolvedStatus = request.getResultStatus() != null
            ? request.getResultStatus()
            : ctuGrade.getResultStatus();

        // ── 4. Xây dựng breakdown chi tiết ──
        Map<String, Object> breakdown = new HashMap<>(request.getComponentBreakdown() != null ? request.getComponentBreakdown() : Map.of());
        breakdown.put("ctu_scale_4", ctuGrade.getScoreScale4());
        breakdown.put("ctu_letter_grade", ctuGrade.getLetterGrade());
        breakdown.put("ctu_classification", ctuGrade.getClassification());
        breakdown.put("weights", Map.of(
            "mentor_weight", wMentor,
            "lecturer_weight", wLecturer,
            "compliance_weight", wCompliance
        ));
        breakdown.put("rubric_sources", Map.of(
            "mentor_rubric_found", mentorRubric.isPresent(),
            "lecturer_rubric_found", lecturerRubric.isPresent(),
            "auto_aggregated", Boolean.TRUE.equals(request.getAutoAggregateFromRubrics())
        ));

        FinalResult result = finalResultRepository.findByPlacementId(request.getPlacementId())
            .orElse(FinalResult.builder()
                .placement(placement)
                .build());

        result.setMentorScore(effectiveMentor);
        result.setLecturerScore(effectiveLecturer);
        result.setComplianceScore(complianceScore);
        result.setComponentBreakdown(breakdown);
        result.setFinalScore(total10);
        result.setResultStatus(resolvedStatus);
        result.setDecidedBy(admin);
        result.setFinalizedAt(OffsetDateTime.now());

        // ── 5. Xử lý luồng Nháp (DRAFT) vs Công bố (PUBLISHED) ──
        boolean publish = Boolean.TRUE.equals(request.getPublishImmediately());
        if (publish) {
            result.setPublishedAt(OffsetDateTime.now());
            if (resolvedStatus == ResultStatus.PASSED) {
                placement.setStatus(PlacementStatus.COMPLETED);
                placementRepository.save(placement);
            }
        } else {
            result.setPublishedAt(null); // Lưu nháp chờ phê duyệt
        }

        FinalResult saved = finalResultRepository.save(result);

        // ── Hooks: AuditLog & Notification nếu công bố ───────────────────
        if (publish) {
            auditLogService.logAction(
                decidedByUserId,
                "FINALIZE_AND_PUBLISH_RESULT",
                "FinalResult",
                saved.getId(),
                "SUCCESS",
                Map.of("finalScore", total10, "status", resolvedStatus.name()),
                null
            );

            UUID studentId = placement.getStudent().getId();
            notificationService.sendNotification(
                studentId,
                "FINAL_RESULT_PUBLISHED",
                "Kết quả thực tập chính thức đã công bố",
                String.format("Kết quả thực tập của bạn: Điểm %.2f (Điểm chữ %s, Thang 4: %.1f). Kết quả: %s.",
                    total10, ctuGrade.getLetterGrade(), ctuGrade.getScoreScale4(),
                    resolvedStatus == ResultStatus.PASSED ? "ĐẠT" : "KHÔNG ĐẠT"),
                "/final-results/placement/" + placement.getId()
            );
        } else {
            auditLogService.logAction(
                decidedByUserId,
                "DRAFT_FINAL_RESULT",
                "FinalResult",
                saved.getId(),
                "SUCCESS",
                Map.of("finalScore", total10, "isDraft", true),
                null
            );
        }

        log.info("Tổng hợp điểm thực tập cho placement {}: thang 10={}, hệ 4={}, điểm chữ={}, published={}",
            placement.getId(), total10, ctuGrade.getScoreScale4(), ctuGrade.getLetterGrade(), publish);

        return mapToResponse(saved);
    }

    /**
     * Công bố chính thức kết quả thực tập cho sinh viên.
     */
    @Override
    @Transactional
    public FinalResultResponse publishFinalResult(UUID placementId, UUID publishedByUserId) {
        FinalResult result = finalResultRepository.findByPlacementId(placementId)
            .orElseThrow(() -> new ResourceNotFoundException("FinalResult", "placementId", placementId));

        if (result.getFinalizedAt() == null) {
            throw new BadRequestException("Kết quả thực tập chưa được tổng hợp điểm. Vui lòng tổng hợp điểm trước khi công bố.");
        }

        User publisher = userRepository.findById(publishedByUserId)
            .orElseThrow(() -> new ResourceNotFoundException("User", "id", publishedByUserId));

        result.setPublishedAt(OffsetDateTime.now());
        result.setDecidedBy(publisher);

        // Khi công bố chính thức và sinh viên ĐẠT (PASSED), hoàn tất đợt thực tập
        if (result.getResultStatus() == ResultStatus.PASSED) {
            InternshipPlacement placement = result.getPlacement();
            placement.setStatus(PlacementStatus.COMPLETED);
            placementRepository.save(placement);
        }

        FinalResult saved = finalResultRepository.save(result);

        // ── Hooks: AuditLog & Notification ────────────────────────────────
        CtuGradingHelper.CtuGrade ctuGrade = CtuGradingHelper.convertFromScale10(saved.getFinalScore());

        auditLogService.logAction(
            publishedByUserId,
            "PUBLISH_FINAL_RESULT",
            "FinalResult",
            saved.getId(),
            "SUCCESS",
            Map.of("finalScore", saved.getFinalScore(), "status", saved.getResultStatus().name()),
            null
        );

        UUID studentId = result.getPlacement().getStudent().getId();
        notificationService.sendNotification(
            studentId,
            "FINAL_RESULT_PUBLISHED",
            "Kết quả thực tập chính thức đã công bố",
            String.format("Kết quả thực tập của bạn: Điểm %.2f (Điểm chữ %s, Thang 4: %.1f). Kết quả: %s.",
                saved.getFinalScore(), ctuGrade.getLetterGrade(), ctuGrade.getScoreScale4(),
                saved.getResultStatus() == ResultStatus.PASSED ? "ĐẠT" : "KHÔNG ĐẠT"),
            "/final-results/placement/" + placementId
        );

        log.info("Đã công bố chính thức kết quả thực tập cho placement {}", placementId);
        return mapToResponse(saved);
    }

    private FinalResultResponse mapToResponse(FinalResult entity) {
        String studentCode = studentProfileRepository.findById(entity.getPlacement().getStudent().getId())
            .map(StudentProfile::getStudentCode)
            .orElse(null);

        // Quy đổi thang điểm CTU
        CtuGradingHelper.CtuGrade ctuGrade = CtuGradingHelper.convertFromScale10(entity.getFinalScore());

        return FinalResultResponse.builder()
            .id(entity.getId())
            .placementId(entity.getPlacement().getId())
            .studentName(entity.getPlacement().getStudent().getFullName())
            .studentCode(studentCode)
            .companyName(entity.getPlacement().getCompany().getCompanyName())
            .mentorScore(entity.getMentorScore())
            .lecturerScore(entity.getLecturerScore())
            .complianceScore(entity.getComplianceScore())
            .componentBreakdown(entity.getComponentBreakdown())
            .finalScore(entity.getFinalScore())
            .scoreScale4(ctuGrade.getScoreScale4())
            .letterGrade(ctuGrade.getLetterGrade())
            .classification(ctuGrade.getClassification())
            .resultStatus(entity.getResultStatus())
            .decidedByUserId(entity.getDecidedBy() != null ? entity.getDecidedBy().getId() : null)
            .decidedByName(entity.getDecidedBy() != null ? entity.getDecidedBy().getFullName() : null)
            .isPublished(entity.getPublishedAt() != null)
            .publishedAt(entity.getPublishedAt())
            .finalizedAt(entity.getFinalizedAt())
            .createdAt(entity.getCreatedAt())
            .build();
    }
}
