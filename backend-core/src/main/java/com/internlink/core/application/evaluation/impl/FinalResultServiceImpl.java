package com.internlink.core.application.evaluation.impl;

import com.internlink.core.application.evaluation.CtuGradingHelper;
import com.internlink.core.application.evaluation.FinalResultService;
import com.internlink.core.application.system.AuditLogService;
import com.internlink.core.application.system.NotificationService;
import com.internlink.core.domain.auth.User;
import com.internlink.core.domain.evaluation.FinalResult;
import com.internlink.core.domain.evaluation.AssessmentComponentScore;
import com.internlink.core.application.evaluation.AssessmentRules;
import com.internlink.core.domain.placement.InternshipPlacement;
import com.internlink.core.domain.student.StudentProfile;
import com.internlink.core.infrastructure.persistence.jpa.*;
import com.internlink.core.presentation.evaluation.dto.request.FinalResultRequest;
import com.internlink.core.presentation.evaluation.dto.response.FinalResultResponse;
import com.internlink.core.shared.enums.PlacementStatus;
import com.internlink.core.shared.enums.ResultStatus;
import com.internlink.core.shared.enums.LogbookStatus;
import com.internlink.core.shared.enums.UserRole;
import com.internlink.core.shared.exception.BadRequestException;
import com.internlink.core.shared.exception.ResourceNotFoundException;
import com.internlink.core.shared.security.SecurityGuard;
import com.internlink.core.shared.security.ResourceAuthorization;
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
    private final JpaAssessmentComponentScoreRepository componentScoreRepository;
    private final JpaWeeklyLogbookRepository logbookRepository;
    private final JpaInternshipReportRepository reportRepository;
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

        ResourceAuthorization.require(ResourceAuthorization.canReadPlacement(
            requestingUser, result.getPlacement()));

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
        return getFinalResultByPlacement(placementId, securityGuard.currentUser().getId());
    }

    /**
     * Tính toán và tổng hợp điểm tổng kết:
     * Tổng hợp các thành phần đã xác minh theo đề cương được gán cho sinh viên.
     * Nhật ký và báo cáo bắt buộc phải được duyệt trước khi tính điểm.
     */
    @Override
    @Transactional
    public FinalResultResponse calculateAndFinalizeResult(UUID decidedByUserId, FinalResultRequest request) {
        InternshipPlacement placement = placementRepository.findById(request.getPlacementId())
            .orElseThrow(() -> new ResourceNotFoundException("InternshipPlacement", "id", request.getPlacementId()));

        User admin = userRepository.findById(decidedByUserId)
            .orElseThrow(() -> new ResourceNotFoundException("User", "id", decidedByUserId));
        ResourceAuthorization.require(ResourceAuthorization.managesDepartment(
            admin, placement.getTerm().getDepartment().getId()));

        if (request.getMentorScore() != null || request.getLecturerScore() != null
            || request.getComplianceScore() != null || request.getMentorWeight() != null
            || request.getLecturerWeight() != null || request.getComplianceWeight() != null
            || Boolean.FALSE.equals(request.getAutoAggregateFromRubrics())
            || request.getOverrideReason() != null
            || request.getComponentBreakdown() != null && !request.getComponentBreakdown().isEmpty())
            throw new BadRequestException("Không được nhập điểm hoặc trọng số thủ công; hệ thống lấy theo đề cương đã duyệt");
        FinalResult existing = finalResultRepository.findByPlacementId(placement.getId()).orElse(null);
        if (existing != null && existing.getPublishedAt() != null)
            throw new BadRequestException("Kết quả đã công bố, không thể tính lại trực tiếp");

        Map<String, AssessmentComponentScore> verifiedScores = requireReadyForFinalization(placement);
        Map<String, Object> componentBreakdown = new LinkedHashMap<>();
        BigDecimal total10 = BigDecimal.ZERO;
        for (Map<String, Object> definition : placement.getAssessmentScheme().getComponents()) {
            String code = String.valueOf(definition.get("code"));
            AssessmentComponentScore component = verifiedScores.get(code);
            BigDecimal weight = AssessmentRules.number(definition.get("weight"));
            total10 = total10.add(component.getScore().multiply(weight));
            Map<String, Object> detail = new LinkedHashMap<>();
            detail.put("score", component.getScore());
            detail.put("weight", weight);
            detail.put("source", component.getSource());
            detail.put("evidenceDocumentId", component.getEvidenceDocument() != null
                ? component.getEvidenceDocument().getId().toString() : null);
            detail.put("criteriaScores", component.getCriteriaScores());
            componentBreakdown.put(code, detail);
        }
        total10 = total10.setScale(1, RoundingMode.HALF_UP);
        CtuGradingHelper.CtuGrade ctuGrade = CtuGradingHelper.convertFromScale10(total10);

        ResultStatus resolvedStatus = ctuGrade.getResultStatus();
        if (request.getResultStatus() != null && request.getResultStatus() != resolvedStatus) {
            throw new BadRequestException("Trạng thái đạt/không đạt không khớp điểm tổng kết");
        }

        Map<String, Object> breakdown = new LinkedHashMap<>();
        breakdown.put("assessment_scheme_id", placement.getAssessmentScheme().getId().toString());
        breakdown.put("course_code", placement.getAssessmentScheme().getCourseCode());
        breakdown.put("revision", placement.getAssessmentScheme().getRevision());
        breakdown.put("components", componentBreakdown);
        breakdown.put("ctu_scale_4", ctuGrade.getScoreScale4());
        breakdown.put("ctu_letter_grade", ctuGrade.getLetterGrade());
        breakdown.put("ctu_classification", ctuGrade.getClassification());

        FinalResult result = existing != null ? existing : FinalResult.builder().placement(placement).build();
        result.setMentorScore(null);
        result.setLecturerScore(null);
        result.setComplianceScore(null);
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
                String.format("Kết quả thực tập của bạn: Điểm %.1f (Điểm chữ %s, Thang 4: %.1f). Kết quả: %s.",
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
        if (result.getPublishedAt() != null) throw new BadRequestException("Kết quả đã được công bố");
        requireReadyForFinalization(result.getPlacement());
        if (result.getPlacement().getAssessmentScheme() == null
            || !result.getPlacement().getAssessmentScheme().getId().toString().equals(
                result.getComponentBreakdown().get("assessment_scheme_id")))
            throw new BadRequestException("Bản nháp không dùng phương án đánh giá hiện hành; cần tổng hợp lại");

        User publisher = userRepository.findById(publishedByUserId)
            .orElseThrow(() -> new ResourceNotFoundException("User", "id", publishedByUserId));
        ResourceAuthorization.require(ResourceAuthorization.managesDepartment(
            publisher, result.getPlacement().getTerm().getDepartment().getId()));

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
            String.format("Kết quả thực tập của bạn: Điểm %.1f (Điểm chữ %s, Thang 4: %.1f). Kết quả: %s.",
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
            .companyName(entity.getPlacement().getCompany() != null
                ? entity.getPlacement().getCompany().getCompanyName()
                : entity.getPlacement().getStudentFoundApplication().getHostName())
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

    private Map<String, AssessmentComponentScore> requireReadyForFinalization(InternshipPlacement placement) {
        if (placement.getStatus() != PlacementStatus.ACTIVE)
            throw new BadRequestException("Chỉ tổng hợp điểm khi lần thực tập đang ACTIVE");
        var scheme = placement.getAssessmentScheme();
        if (scheme == null || !List.of("APPROVED", "RETIRED").contains(scheme.getStatus()))
            throw new BadRequestException("Chưa gán phương án đánh giá được duyệt cho học phần");
        AssessmentRules.validate(scheme.getComponents());
        var logbooks = logbookRepository.findByPlacementIdOrderByWeekNumberAsc(placement.getId());
        LogbookStatus requiredStatus = "STUDENT_FOUND".equals(placement.getSource())
            ? LogbookStatus.APPROVED_BY_LECTURER : LogbookStatus.APPROVED_BY_MENTOR;
        for (int week = 1; week <= scheme.getRequiredLogbookWeeks(); week++) {
            int requiredWeek = week;
            if (logbooks.stream().noneMatch(l -> l.getWeekNumber() == requiredWeek && l.getStatus() == requiredStatus))
                throw new BadRequestException("Thiếu nhật ký tuần " + week + " đã được duyệt");
        }
        var reports = reportRepository.findByPlacementId(placement.getId());
        if (Boolean.TRUE.equals(scheme.getRequireMidtermReport())
            && reports.stream().noneMatch(r -> "MIDTERM".equals(r.getReportType())
                && "APPROVED".equals(r.getStatus()) && "ACTIVE".equals(r.getDocument().getStatus())))
            throw new BadRequestException("Thiếu báo cáo giữa kỳ được duyệt");
        if (Boolean.TRUE.equals(scheme.getRequireFinalReport())
            && reports.stream().noneMatch(r -> "FINAL".equals(r.getReportType())
                && "APPROVED".equals(r.getStatus()) && "ACTIVE".equals(r.getDocument().getStatus())))
            throw new BadRequestException("Thiếu báo cáo cuối kỳ được duyệt");
        Map<String, AssessmentComponentScore> scores = new HashMap<>();
        for (AssessmentComponentScore item : componentScoreRepository.findByPlacementId(placement.getId())) {
            scores.put(item.getComponentCode(), item);
        }
        for (Map<String, Object> component : scheme.getComponents()) {
            String code = String.valueOf(component.get("code"));
            AssessmentComponentScore item = scores.get(code);
            if (item == null || !"VERIFIED".equals(item.getStatus())
                || (item.getEvidenceDocument() != null && !"ACTIVE".equals(item.getEvidenceDocument().getStatus())))
                throw new BadRequestException("Thiếu điểm thành phần đã xác minh: " + code);
        }
        return scores;
    }
}
