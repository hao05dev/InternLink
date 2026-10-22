package com.internlink.core.application.ai_matching;

import com.internlink.core.domain.recruitment.JobPosition;
import com.internlink.core.infrastructure.persistence.jpa.JpaJobPositionRepository;
import com.internlink.core.shared.enums.JobStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RecommendationCandidateService {

    private final JpaJobPositionRepository jobPositionRepository;
    private final RecommendationEligibilityService eligibilityService;

    @Transactional(readOnly = true)
    public List<JobPosition> findEligibleCandidateJobs(UUID studentId, UUID termId) {
        EligibilityResult termEligibility = eligibilityService.checkStudentTermEligibility(studentId, termId);
        if (!termEligibility.isEligible()) {
            return List.of();
        }

        List<JobPosition> approvedJobs = jobPositionRepository.findByTermIdAndStatus(termId, JobStatus.APPROVED);
        OffsetDateTime now = OffsetDateTime.now();

        return approvedJobs.stream()
            .filter(job -> eligibilityService.evaluateJobEligibility(studentId, job, now).isEligible())
            .toList();
    }
}
