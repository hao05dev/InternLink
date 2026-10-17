package com.internlink.core.application.recruitment.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import com.internlink.core.application.system.AuditLogService;
import com.internlink.core.application.system.NotificationService;
import com.internlink.core.domain.auth.User;
import com.internlink.core.domain.company.Company;
import com.internlink.core.domain.organization.AcademicProgram;
import com.internlink.core.domain.organization.Department;
import com.internlink.core.domain.organization.InternshipTerm;
import com.internlink.core.domain.organization.StudentRoster;
import com.internlink.core.domain.recruitment.JobApplication;
import com.internlink.core.domain.recruitment.JobPosition;
import com.internlink.core.domain.recruitment.PlacementOffer;
import com.internlink.core.domain.student.StudentProfile;
import com.internlink.core.domain.system.Document;
import com.internlink.core.infrastructure.persistence.jpa.*;
import com.internlink.core.infrastructure.persistence.jpa.JpaStudentProfileRepository;
import com.internlink.core.infrastructure.persistence.jpa.JpaStudentRosterRepository;
import com.internlink.core.infrastructure.security.CustomUserDetail;
import com.internlink.core.presentation.recruitment.dto.request.JobApplicationRequest;
import com.internlink.core.presentation.recruitment.dto.request.JobPositionRequest;
import com.internlink.core.presentation.recruitment.dto.request.PlacementOfferRequest;
import com.internlink.core.shared.enums.*;
import com.internlink.core.shared.exception.BadRequestException;
import com.internlink.core.shared.exception.ForbiddenException;
import com.internlink.core.shared.security.SecurityGuard;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

class PlacementOfferWorkflowTest extends RecruitmentTestFixture {
    @Test
    void studentCannotReadAnotherStudentsOffer() {
        JobApplication application = application(ApplicationStatus.OFFERED);
        PlacementOffer offer = PlacementOffer.builder().application(application).build();
        offer.setId(UUID.randomUUID());
        User stranger = user(UserRole.STUDENT);
        when(offerRepository.findById(offer.getId())).thenReturn(Optional.of(offer));
        when(securityGuard.currentUser()).thenReturn(CustomUserDetail.create(stranger));
        when(userRepository.findById(stranger.getId())).thenReturn(Optional.of(stranger));

        assertThatThrownBy(() -> offerService.getOfferById(offer.getId()))
                .isInstanceOf(ForbiddenException.class);
    }

    @Test
    void createOfferRequiresActiveReviewAndValidDates() {
        JobApplication application = application(ApplicationStatus.SUBMITTED);
        User representative = user(UserRole.COMPANY_REP);
        representative.setCompany(application.getJob().getCompany());
        when(applicationRepository.findById(application.getId()))
                .thenReturn(Optional.of(application));
        when(userRepository.findById(representative.getId()))
                .thenReturn(Optional.of(representative));
        when(securityGuard.currentUser()).thenReturn(CustomUserDetail.create(representative));
        when(offerRepository.findByApplicationId(application.getId())).thenReturn(Optional.empty());

        PlacementOfferRequest request = offerRequest(application.getId());
        assertThatThrownBy(() -> offerService.createOffer(request))
                .isInstanceOf(BadRequestException.class);
    }

    @Test
    void declinedOfferAlsoClosesApplication() {
        JobApplication application = application(ApplicationStatus.OFFERED);
        PlacementOffer offer =
                PlacementOffer.builder()
                        .application(application)
                        .startDate(LocalDate.now().plusDays(1))
                        .endDate(LocalDate.now().plusMonths(3))
                        .expiresAt(OffsetDateTime.now().plusDays(1))
                        .status(OfferStatus.SENT)
                        .termsSnapshot(Map.of())
                        .build();
        offer.setId(UUID.randomUUID());
        when(offerRepository.findById(offer.getId())).thenReturn(Optional.of(offer));
        when(securityGuard.currentUser())
                .thenReturn(CustomUserDetail.create(application.getStudent()));

        assertThat(offerService.respondToOffer(offer.getId(), OfferStatus.DECLINED).getStatus())
                .isEqualTo(OfferStatus.DECLINED);
        assertThat(application.getStatus()).isEqualTo(ApplicationStatus.REJECTED);
        verify(applicationRepository).save(application);
    }

    @Test
    void studentCannotSetAdministrativeOfferStatus() {
        PlacementOffer offer =
                PlacementOffer.builder()
                        .application(application(ApplicationStatus.OFFERED))
                        .expiresAt(OffsetDateTime.now().plusDays(1))
                        .status(OfferStatus.SENT)
                        .build();
        offer.setId(UUID.randomUUID());
        when(offerRepository.findById(offer.getId())).thenReturn(Optional.of(offer));
        when(securityGuard.currentUser())
                .thenReturn(CustomUserDetail.create(offer.getApplication().getStudent()));

        assertThatThrownBy(() -> offerService.respondToOffer(offer.getId(), OfferStatus.WITHDRAWN))
                .isInstanceOf(BadRequestException.class);
    }

}
