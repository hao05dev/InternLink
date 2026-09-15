package com.internlink.core.dto.ai;

import com.internlink.core.entity.CurriculumVitae;
import com.internlink.core.entity.CvAnalysis;
import java.util.Map;

public record CvResponse(
        Long id,
        String fileName,
        String fileUrl,
        Boolean isDefault,
        Map<String, Object> extractedSkills,
        String educationInfo,
        String experienceInfo,
        Double aiScore) {
    public static CvResponse of(CurriculumVitae cv, CvAnalysis analysis) {
        return new CvResponse(
                cv.getId(),
                cv.getFileName(),
                cv.getFileUrl(),
                cv.getIsDefault(),
                analysis != null ? analysis.getExtractedSkills() : null,
                analysis != null ? analysis.getEducationInfo() : null,
                analysis != null ? analysis.getExperienceInfo() : null,
                analysis != null ? analysis.getAiScore() : null);
    }
}