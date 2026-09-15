package com.internlink.core.controller;

import com.internlink.core.dto.ai.MatchingResponse;
import com.internlink.core.security.CustomUserDetails;
import com.internlink.core.service.AiMatchingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/ai/matching")
@RequiredArgsConstructor
public class AiMatchingController {

    private final AiMatchingService aiMatchingService;

    // Sinh viên xem danh sách các vị trí thực tập được AI gợi ý & xếp hạng theo mức
    // độ phù hợp
    @GetMapping("/recommendations")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<List<MatchingResponse>> getRecommendedJobs(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(aiMatchingService.matchJobsForStudent(userDetails.getId()));
    }
}