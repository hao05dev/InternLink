package com.internlink.core.presentation.ai_matching.controller;

import com.internlink.core.application.ai_matching.AiMatchingService;
import com.internlink.core.infrastructure.security.CustomUserDetail;
import com.internlink.core.presentation.ai_matching.dto.response.AiMatchScoreResponse;
import com.internlink.core.presentation.ai_matching.dto.response.SkillTaxonomyResponse;
import com.internlink.core.presentation.ai_matching.dto.response.StudentSkillResponse;
import com.internlink.core.shared.api.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/matching")
@RequiredArgsConstructor
public class AiMatchingController {

    private final AiMatchingService aiMatchingService;

    @GetMapping("/skills/taxonomy")
    public ResponseEntity<ApiResponse<List<SkillTaxonomyResponse>>> getAllTaxonomySkills() {
        List<SkillTaxonomyResponse> skills = aiMatchingService.getAllTaxonomySkills();
        return ResponseEntity.ok(ApiResponse.success(skills));
    }

    @GetMapping("/skills/my-skills")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<List<StudentSkillResponse>>> getMySkills(
        @AuthenticationPrincipal CustomUserDetail userDetail
    ) {
        List<StudentSkillResponse> skills = aiMatchingService.getSkillsByStudent(userDetail.getId());
        return ResponseEntity.ok(ApiResponse.success(skills));
    }

    @GetMapping("/skills/student/{studentId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'FACULTY_ADMIN', 'LECTURER', 'COMPANY_REP')")
    public ResponseEntity<ApiResponse<List<StudentSkillResponse>>> getSkillsByStudent(
        @PathVariable UUID studentId
    ) {
        List<StudentSkillResponse> skills = aiMatchingService.getSkillsByStudent(studentId);
        return ResponseEntity.ok(ApiResponse.success(skills));
    }

    @PostMapping("/skills/sync-cv")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<List<StudentSkillResponse>>> syncSkillsFromCv(
        @AuthenticationPrincipal CustomUserDetail userDetail,
        @RequestParam(required = false) UUID documentId,
        @RequestBody String cvText
    ) {
        List<StudentSkillResponse> skills = aiMatchingService.syncCvSkills(userDetail.getId(), documentId, cvText);
        return ResponseEntity.ok(ApiResponse.success("Trích xuất và đồng bộ kỹ năng từ CV thành công", skills));
    }

    @PatchMapping("/skills/{skillId}/confirm")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<StudentSkillResponse>> confirmSkill(
        @AuthenticationPrincipal CustomUserDetail userDetail,
        @PathVariable String skillId,
        @RequestParam Boolean confirmed
    ) {
        StudentSkillResponse skill = aiMatchingService.confirmStudentSkill(userDetail.getId(), skillId, confirmed);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật xác nhận kỹ năng thành công", skill));
    }

    @GetMapping("/jobs/{jobId}/score")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<AiMatchScoreResponse>> calculateJobMatchScore(
        @AuthenticationPrincipal CustomUserDetail userDetail,
        @PathVariable UUID jobId
    ) {
        AiMatchScoreResponse score = aiMatchingService.calculateMatchScoreForJob(userDetail.getId(), jobId);
        return ResponseEntity.ok(ApiResponse.success(score));
    }

    @GetMapping("/recommendations/term/{termId}")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<List<AiMatchScoreResponse>>> recommendJobsForStudent(
        @AuthenticationPrincipal CustomUserDetail userDetail,
        @PathVariable UUID termId
    ) {
        List<AiMatchScoreResponse> recommendations = aiMatchingService.recommendJobsForStudent(userDetail.getId(), termId);
        return ResponseEntity.ok(ApiResponse.success(recommendations));
    }
}
