package com.internlink.core.application.evaluation.impl;

import com.internlink.core.domain.auth.User;
import com.internlink.core.domain.company.Company;
import com.internlink.core.domain.evaluation.FinalResult;
import com.internlink.core.domain.organization.AcademicProgram;
import com.internlink.core.domain.organization.Department;
import com.internlink.core.domain.organization.InternshipTerm;
import com.internlink.core.domain.placement.InternshipPlacement;
import com.internlink.core.domain.placement.LearningAgreement;
import com.internlink.core.domain.recruitment.JobApplication;
import com.internlink.core.domain.recruitment.JobPosition;
import com.internlink.core.domain.recruitment.PlacementOffer;
import com.internlink.core.infrastructure.persistence.jpa.*;
import com.internlink.core.presentation.evaluation.dto.response.CloAchievementReport;
import com.internlink.core.shared.enums.PlacementStatus;
import com.internlink.core.shared.enums.ResultStatus;
import com.internlink.core.shared.enums.UserRole;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CloReportServiceImplTest {

    @Mock JpaInternshipTermRepository termRepository;
    @Mock JpaInternshipPlacementRepository placementRepository;
    @Mock JpaFinalResultRepository finalResultRepository;
    @Mock JpaAcademicProgramRepository programRepository;
    @Mock JpaStudentProfileRepository studentProfileRepository;

    @InjectMocks
    private CloReportServiceImpl cloReportService;

    @Test
    void generateTermCloReportAggregatesAttainmentAndCtuGrades() {
        UUID termId = UUID.randomUUID();
        InternshipTerm term = InternshipTerm.builder()
            .code("TERM-2026-1")
            .termName("Học kỳ 1 2026-2027")
            .build();
        term.setId(termId);

        UUID placementId1 = UUID.randomUUID();
        UUID placementId2 = UUID.randomUUID();

        InternshipPlacement p1 = mockPlacement(placementId1, "CLO1", "CLO2");
        InternshipPlacement p2 = mockPlacement(placementId2, "CLO1", "CLO3");

        FinalResult r1 = FinalResult.builder()
            .placement(p1)
            .finalScore(new BigDecimal("8.50"))
            .resultStatus(ResultStatus.PASSED)
            .publishedAt(OffsetDateTime.now())
            .build();

        FinalResult r2 = FinalResult.builder()
            .placement(p2)
            .finalScore(new BigDecimal("3.50"))
            .resultStatus(ResultStatus.FAILED)
            .publishedAt(OffsetDateTime.now())
            .build();

        when(termRepository.findById(termId)).thenReturn(Optional.of(term));
        when(placementRepository.findByTermId(termId)).thenReturn(List.of(p1, p2));
        when(finalResultRepository.findByPlacementId(placementId1)).thenReturn(Optional.of(r1));
        when(finalResultRepository.findByPlacementId(placementId2)).thenReturn(Optional.of(r2));

        CloAchievementReport report = cloReportService.generateTermCloReport(termId);

        assertThat(report.getTermCode()).isEqualTo("TERM-2026-1");
        assertThat(report.getTotalPlacements()).isEqualTo(2);
        assertThat(report.getEvaluatedPlacements()).isEqualTo(2);
        assertThat(report.getPassedPlacements()).isEqualTo(1);
        assertThat(report.getOverallPassRate()).isEqualByComparingTo("50.00");
        assertThat(report.getAverageFinalScore()).isEqualByComparingTo("6.00");

        // Phổ điểm CTU
        assertThat(report.getLetterGradeDistribution()).containsEntry("B+", 1L);
        assertThat(report.getLetterGradeDistribution()).containsEntry("F", 1L);

        // Chuẩn đầu ra CLO1 có 2 sinh viên (1 đạt, 1 rớt -> 50%)
        assertThat(report.getCloMetrics()).anySatisfy(metric -> {
            if ("CLO1".equals(metric.getCloCode())) {
                assertThat(metric.getTargetStudentsCount()).isEqualTo(2);
                assertThat(metric.getPassedStudentsCount()).isEqualTo(1);
                assertThat(metric.getAttainmentRate()).isEqualByComparingTo("50.00");
            }
        });
    }

    private InternshipPlacement mockPlacement(UUID placementId, String... clos) {
        JobPosition job = JobPosition.builder()
            .title("Software Engineer Intern")
            .company(Company.builder().companyName("Tech Corp").build())
            .targetLearningOutcomes(List.of(clos))
            .build();

        JobApplication application = JobApplication.builder()
            .job(job)
            .student(User.builder().fullName("Student").role(UserRole.STUDENT).build())
            .build();

        PlacementOffer offer = PlacementOffer.builder()
            .application(application)
            .build();

        LearningAgreement agreement = LearningAgreement.builder()
            .offer(offer)
            .student(application.getStudent())
            .company(job.getCompany())
            .department(Department.builder().name("CNTT").build())
            .build();

        InternshipPlacement placement = InternshipPlacement.builder()
            .agreement(agreement)
            .student(application.getStudent())
            .company(job.getCompany())
            .status(PlacementStatus.ACTIVE)
            .build();
        placement.setId(placementId);
        return placement;
    }
}
