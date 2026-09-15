package com.internlink.core.dto.ai;

import com.internlink.core.entity.MatchingResult;
import java.util.List;

public record MatchingResponse(
        Long id,
        Long jobId,
        String jobTitle,
        String companyName,
        Long studentProfileId,
        Double overallScore,
        Double matchPercentage,
        List<String> matchedSkills,
        List<String> missingSkills,
        String recommendation) {
    public static MatchingResponse of(MatchingResult result, String jobTitle, String companyName) {
        return new MatchingResponse(
                result.getId(),
                result.getJobId(),
                jobTitle,
                companyName,
                result.getStudentProfileId(),
                result.getOverallScore(),
                result.getMatchPercentage(),
                result.getMatchedSkills(),
                result.getMissingSkills(),
                result.getRecommendation());
    }
}