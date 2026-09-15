package com.internlink.core.dto.job;

import com.internlink.core.entity.Job;
import java.util.List;

public record JobResponse(
        Long id,
        Long companyId,
        String companyName,
        String title,
        String description,
        String targetMajor,
        String locationRaw,
        String workFormat,
        Integer slots,
        Integer filledSlots,
        String stipendRange,
        String benefits,
        String expectedLearningOutcomes,
        String status,
        String facultyFeedback,
        Integer version,
        List<JobSkillDto> skills) {
    public static JobResponse of(Job job, String companyName, List<JobSkillDto> skills) {
        return new JobResponse(
                job.getId(),
                job.getCompanyId(),
                companyName,
                job.getTitle(),
                job.getDescription(),
                job.getTargetMajor(),
                job.getLocationRaw(),
                job.getWorkFormat(),
                job.getSlots(),
                job.getFilledSlots(),
                job.getStipendRange(),
                job.getBenefits(),
                job.getExpectedLearningOutcomes(),
                job.getStatus(),
                job.getFacultyFeedback(),
                job.getVersion(),
                skills);
    }
}