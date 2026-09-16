package com.internlink.core.service;

import com.internlink.core.dto.analytics.AdminDashboardResponse;
import com.internlink.core.repository.*;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Collections;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AnalyticsServiceTest {

    @Mock
    private StudentProfileRepository studentProfileRepository;
    @Mock
    private CompanyRepository companyRepository;
    @Mock
    private JobRepository jobRepository;
    @Mock
    private ApplicationRepository applicationRepository;
    @Mock
    private LearningAgreementRepository learningAgreementRepository;
    @Mock
    private InternshipIncidentRepository incidentRepository;
    @Mock
    private RubricCriteriaScoreRepository criteriaScoreRepository;
    @Mock
    private LogbookRepository logbookRepository;
    @Mock
    private RubricEvaluationRepository evaluationRepository;
    @Mock
    private NotificationRepository notificationRepository;
    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private AnalyticsService analyticsService;

    @Test
    @DisplayName("Lấy số liệu Admin Dashboard chính xác")
    void getAdminDashboardMetrics_Success() {
        when(studentProfileRepository.count()).thenReturn(100L);
        when(companyRepository.count()).thenReturn(20L);
        when(jobRepository.count()).thenReturn(35L);
        when(applicationRepository.count()).thenReturn(150L);
        when(learningAgreementRepository.count()).thenReturn(85L);
        when(incidentRepository.count()).thenReturn(2L);
        when(applicationRepository.findAll()).thenReturn(Collections.emptyList());
        when(criteriaScoreRepository.findAll()).thenReturn(Collections.emptyList());

        AdminDashboardResponse res = analyticsService.getAdminDashboardMetrics();

        assertNotNull(res);
        assertEquals(100L, res.getTotalStudents());
        assertEquals(20L, res.getTotalCompanies());
        assertEquals(85.0, res.getOverallPlacementRate());
    }
}