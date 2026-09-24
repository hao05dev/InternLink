package com.internlink.core.presentation.ai_matching.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AiMatchScoreResponse {

    private UUID jobId;
    private String jobTitle;
    private String companyName;
    private BigDecimal matchScore; // Thang điểm 0 -> 100%
    private List<String> matchedSkills;
    private List<String> missingSkills;
    private Map<String, Object> explanation;
}