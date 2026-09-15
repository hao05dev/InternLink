package com.internlink.core.controller;

import com.internlink.core.dto.evaluation.*;
import com.internlink.core.entity.NaceCompetency;
import com.internlink.core.security.CustomUserDetails;
import com.internlink.core.service.EvaluationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/evaluations")
@RequiredArgsConstructor
public class EvaluationController {

    private final EvaluationService evaluationService;

    // 1. Danh mục 8 tiêu chí năng lực NACE
    @GetMapping("/nace-competencies")
    public ResponseEntity<List<NaceCompetency>> getNaceCompetencies() {
        return ResponseEntity.ok(evaluationService.getAllNaceCompetencies());
    }

    // 2. Chấm điểm đánh giá Rubric đa chiều
    @PostMapping("/rubrics")
    public ResponseEntity<RubricEvaluationResponse> submitEvaluation(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody RubricEvaluationRequest request) {
        return ResponseEntity.ok(evaluationService.createOrUpdateEvaluation(
                request, userDetails.getId(), userDetails.getUser().getRole()));
    }

    // 3. Lấy danh sách phiếu đánh giá theo Learning Agreement
    @GetMapping("/rubrics/agreement/{agreementId}")
    public ResponseEntity<List<RubricEvaluationResponse>> getEvaluationsByAgreement(
            @PathVariable Long agreementId) {
        return ResponseEntity.ok(evaluationService.getEvaluationsByAgreement(agreementId));
    }

    // 4. Khảo sát mức độ hài lòng
    @PostMapping("/surveys")
    public ResponseEntity<SatisfactionSurveyResponse> submitSurvey(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody SatisfactionSurveyRequest request) {
        return ResponseEntity.ok(evaluationService.submitSatisfactionSurvey(request, userDetails.getId()));
    }

    // 5. Lấy khảo sát mức độ hài lòng theo Learning Agreement
    @GetMapping("/surveys/agreement/{agreementId}")
    public ResponseEntity<List<SatisfactionSurveyResponse>> getSurveysByAgreement(
            @PathVariable Long agreementId) {
        return ResponseEntity.ok(evaluationService.getSurveysByAgreement(agreementId));
    }

    // 6. Sinh viên gửi khiếu nại (ILO 208 Grievance)
    @PostMapping("/appeals")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<InternshipAppealResponse> createAppeal(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody InternshipAppealRequest request) {
        return ResponseEntity.ok(evaluationService.createAppeal(request, userDetails.getId()));
    }

    // 7. Giảng viên / Ban chủ nhiệm Khoa / Admin xử lý khiếu nại
    @PutMapping("/appeals/{appealId}/resolve")
    @PreAuthorize("hasAnyRole('LECTURER', 'FACULTY_ADMIN', 'ADMIN')")
    public ResponseEntity<InternshipAppealResponse> resolveAppeal(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long appealId,
            @Valid @RequestBody AppealResolutionRequest request) {
        return ResponseEntity.ok(evaluationService.resolveAppeal(appealId, request, userDetails.getId()));
    }

    // 8. Lấy danh sách khiếu nại theo Learning Agreement
    @GetMapping("/appeals/agreement/{agreementId}")
    public ResponseEntity<List<InternshipAppealResponse>> getAppealsByAgreement(
            @PathVariable Long agreementId) {
        return ResponseEntity.ok(evaluationService.getAppealsByAgreement(agreementId));
    }
}
