package com.internlink.core.application.evaluation.impl;

import com.internlink.core.application.evaluation.CloReportService;
import com.internlink.core.application.evaluation.CtuGradingHelper;
import com.internlink.core.domain.evaluation.FinalResult;
import com.internlink.core.domain.organization.AcademicProgram;
import com.internlink.core.domain.organization.InternshipTerm;
import com.internlink.core.domain.placement.InternshipPlacement;
import com.internlink.core.domain.recruitment.JobPosition;
import com.internlink.core.domain.student.StudentProfile;
import com.internlink.core.infrastructure.persistence.jpa.*;
import com.internlink.core.presentation.evaluation.dto.response.CloAchievementReport;
import com.internlink.core.presentation.evaluation.dto.response.CloMetric;
import com.internlink.core.shared.enums.ResultStatus;
import com.internlink.core.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class CloReportServiceImpl implements CloReportService {

    private final JpaInternshipTermRepository termRepository;
    private final JpaInternshipPlacementRepository placementRepository;
    private final JpaFinalResultRepository finalResultRepository;
    private final JpaAcademicProgramRepository programRepository;
    private final JpaStudentProfileRepository studentProfileRepository;

    @Override
    @Transactional(readOnly = true)
    public CloAchievementReport generateTermCloReport(UUID termId) {
        return buildReport(termId, null);
    }

    @Override
    @Transactional(readOnly = true)
    public CloAchievementReport generateProgramCloReport(UUID termId, UUID programId) {
        AcademicProgram program = programRepository.findById(programId)
            .orElseThrow(() -> new ResourceNotFoundException("AcademicProgram", "id", programId));
        return buildReport(termId, program);
    }

    private CloAchievementReport buildReport(UUID termId, AcademicProgram targetProgram) {
        InternshipTerm term = termRepository.findById(termId)
            .orElseThrow(() -> new ResourceNotFoundException("InternshipTerm", "id", termId));

        List<InternshipPlacement> allPlacements = placementRepository.findByTermId(termId);

        // Lọc theo ngành đào tạo nếu có yêu cầu
        List<InternshipPlacement> filteredPlacements = allPlacements;
        if (targetProgram != null) {
            filteredPlacements = allPlacements.stream()
                .filter(p -> {
                    Optional<StudentProfile> profileOpt = studentProfileRepository.findByUserId(p.getStudent().getId());
                    return profileOpt.isPresent() && profileOpt.get().getProgram().getId().equals(targetProgram.getId());
                })
                .toList();
        }

        long totalPlacements = filteredPlacements.size();

        // Thu thập kết quả đánh giá đã công bố
        Map<UUID, FinalResult> resultMap = new HashMap<>();
        for (InternshipPlacement p : filteredPlacements) {
            finalResultRepository.findByPlacementId(p.getId())
                .filter(r -> r.getPublishedAt() != null)
                .ifPresent(r -> resultMap.put(p.getId(), r));
        }

        long evaluatedCount = resultMap.size();
        long passedCount = resultMap.values().stream()
            .filter(r -> r.getResultStatus() == ResultStatus.PASSED)
            .count();

        BigDecimal overallPassRate = evaluatedCount > 0
            ? BigDecimal.valueOf((double) passedCount / evaluatedCount * 100.0).setScale(2, RoundingMode.HALF_UP)
            : BigDecimal.ZERO;

        // Điểm trung bình toàn kỳ
        BigDecimal avgScore = BigDecimal.ZERO;
        if (evaluatedCount > 0) {
            BigDecimal sum = resultMap.values().stream()
                .map(FinalResult::getFinalScore)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
            avgScore = sum.divide(BigDecimal.valueOf(evaluatedCount), 2, RoundingMode.HALF_UP);
        }

        // Phổ điểm CTU (A, B+, B, C+, C, D+, D, F)
        Map<String, Long> gradeDist = new LinkedHashMap<>();
        List.of("A", "B+", "B", "C+", "C", "D+", "D", "F").forEach(grade -> gradeDist.put(grade, 0L));

        for (FinalResult r : resultMap.values()) {
            CtuGradingHelper.CtuGrade grade = CtuGradingHelper.convertFromScale10(r.getFinalScore());
            String letter = grade.getLetterGrade();
            gradeDist.put(letter, gradeDist.getOrDefault(letter, 0L) + 1L);
        }

        // Thống kê theo từng Chuẩn đầu ra (CLO)
        // Tập hợp danh sách các CLO từ các vị trí thực tập liên quan
        Map<String, List<FinalResult>> cloToResultsMap = new HashMap<>();
        Map<String, Long> cloToTargetCountMap = new HashMap<>();

        for (InternshipPlacement p : filteredPlacements) {
            JobPosition job = getJobPositionFromPlacement(p);
            if (job == null || job.getTargetLearningOutcomes() == null) continue;

            List<String> clos = job.getTargetLearningOutcomes();
            FinalResult result = resultMap.get(p.getId());

            for (String clo : clos) {
                if (clo == null || clo.isBlank()) continue;
                String cleanClo = clo.trim();
                cloToTargetCountMap.put(cleanClo, cloToTargetCountMap.getOrDefault(cleanClo, 0L) + 1L);

                if (result != null) {
                    cloToResultsMap.computeIfAbsent(cleanClo, k -> new ArrayList<>()).add(result);
                }
            }
        }

        List<CloMetric> cloMetrics = new ArrayList<>();
        for (Map.Entry<String, Long> entry : cloToTargetCountMap.entrySet()) {
            String cloCode = entry.getKey();
            long targetCount = entry.getValue();

            List<FinalResult> cloResults = cloToResultsMap.getOrDefault(cloCode, List.of());
            long cloPassedCount = cloResults.stream()
                .filter(r -> r.getResultStatus() == ResultStatus.PASSED)
                .count();

            BigDecimal attainmentRate = targetCount > 0
                ? BigDecimal.valueOf((double) cloPassedCount / targetCount * 100.0).setScale(2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

            BigDecimal cloAvgScore = BigDecimal.ZERO;
            if (!cloResults.isEmpty()) {
                BigDecimal sum = cloResults.stream()
                    .map(FinalResult::getFinalScore)
                    .filter(Objects::nonNull)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
                cloAvgScore = sum.divide(BigDecimal.valueOf(cloResults.size()), 2, RoundingMode.HALF_UP);
            }

            cloMetrics.add(CloMetric.builder()
                .cloCode(cloCode)
                .description("Tỷ lệ đạt điểm tổng kết của nhóm vị trí có mục tiêu " + cloCode
                    + "; chưa đo trực tiếp mức đạt chuẩn đầu ra")
                .targetStudentsCount(targetCount)
                .passedStudentsCount(cloPassedCount)
                .attainmentRate(attainmentRate)
                .averageScore(cloAvgScore)
                .measurementMethod("PLACEMENT_RESULT_PROXY")
                .build());
        }

        // Sắp xếp CLO theo mã
        cloMetrics.sort(Comparator.comparing(CloMetric::getCloCode));

        return CloAchievementReport.builder()
            .termId(term.getId())
            .termCode(term.getCode())
            .termName(term.getTermName())
            .programCode(targetProgram != null ? targetProgram.getCode() : null)
            .programName(targetProgram != null ? targetProgram.getName() : null)
            .totalPlacements(totalPlacements)
            .evaluatedPlacements(evaluatedCount)
            .passedPlacements(passedCount)
            .overallPassRate(overallPassRate)
            .averageFinalScore(avgScore)
            .letterGradeDistribution(gradeDist)
            .cloMetrics(cloMetrics)
            .build();
    }

    private JobPosition getJobPositionFromPlacement(InternshipPlacement placement) {
        try {
            if (placement.getAgreement() != null
                && placement.getAgreement().getOffer() != null
                && placement.getAgreement().getOffer().getApplication() != null) {
                return placement.getAgreement().getOffer().getApplication().getJob();
            }
        } catch (Exception ignored) {
        }
        return null;
    }
}
