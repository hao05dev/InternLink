package com.internlink.core.application.recruitment.impl;

import com.internlink.core.application.recruitment.PlacementOfferService;
import com.internlink.core.domain.auth.User;
import com.internlink.core.domain.recruitment.JobApplication;
import com.internlink.core.domain.recruitment.PlacementOffer;
import com.internlink.core.infrastructure.persistence.jpa.JpaJobApplicationRepository;
import com.internlink.core.infrastructure.persistence.jpa.JpaPlacementOfferRepository;
import com.internlink.core.infrastructure.persistence.jpa.JpaUserRepository;
import com.internlink.core.presentation.recruitment.dto.request.PlacementOfferRequest;
import com.internlink.core.presentation.recruitment.dto.response.PlacementOfferResponse;
import com.internlink.core.shared.enums.ApplicationStatus;
import com.internlink.core.shared.enums.OfferStatus;
import com.internlink.core.shared.exception.BadRequestException;
import com.internlink.core.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PlacementOfferServiceImpl implements PlacementOfferService {

    private final JpaPlacementOfferRepository offerRepository;
    private final JpaJobApplicationRepository applicationRepository;
    private final JpaUserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public PlacementOfferResponse getOfferByApplicationId(UUID applicationId) {
        PlacementOffer offer = offerRepository.findByApplicationId(applicationId)
            .orElseThrow(() -> new ResourceNotFoundException("PlacementOffer", "applicationId", applicationId));
        return mapToResponse(offer);
    }

    @Override
    @Transactional(readOnly = true)
    public PlacementOfferResponse getOfferById(UUID id) {
        PlacementOffer offer = offerRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("PlacementOffer", "id", id));
        return mapToResponse(offer);
    }

    @Override
    @Transactional
    public PlacementOfferResponse createOffer(PlacementOfferRequest request) {
        JobApplication application = applicationRepository.findById(request.getApplicationId())
            .orElseThrow(() -> new ResourceNotFoundException("JobApplication", "id", request.getApplicationId()));

        if (offerRepository.findByApplicationId(request.getApplicationId()).isPresent()) {
            throw new BadRequestException("Đã phát hành Offer cho đơn ứng tuyển này rồi");
        }

        User mentor = null;
        if (request.getProposedMentorId() != null) {
            mentor = userRepository.findById(request.getProposedMentorId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", request.getProposedMentorId()));
        }

        PlacementOffer offer = PlacementOffer.builder()
            .application(application)
            .proposedMentor(mentor)
            .startDate(request.getStartDate())
            .endDate(request.getEndDate())
            .stipend(request.getStipend())
            .termsSnapshot(request.getTermsSnapshot() != null ? request.getTermsSnapshot() : java.util.Map.of())
            .expiresAt(request.getExpiresAt())
            .status(OfferStatus.SENT)
            .build();

        // Cập nhật trạng thái đơn ứng tuyển sang OFFERED
        application.setStatus(ApplicationStatus.OFFERED);
        applicationRepository.save(application);

        return mapToResponse(offerRepository.save(offer));
    }

    @Override
    @Transactional
    public PlacementOfferResponse respondToOffer(UUID id, OfferStatus status) {
        PlacementOffer offer = offerRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("PlacementOffer", "id", id));

        if (offer.getStatus() != OfferStatus.SENT) {
            throw new BadRequestException("Offer này đã được phản hồi hoặc không còn hiệu lực");
        }

        if (OffsetDateTime.now().isAfter(offer.getExpiresAt())) {
            offer.setStatus(OfferStatus.EXPIRED);
            offerRepository.save(offer);
            throw new BadRequestException("Offer đã hết hạn phản hồi");
        }

        offer.setStatus(status);
        offer.setRespondedAt(OffsetDateTime.now());

        return mapToResponse(offerRepository.save(offer));
    }

    private PlacementOfferResponse mapToResponse(PlacementOffer entity) {
        return PlacementOfferResponse.builder()
            .id(entity.getId())
            .applicationId(entity.getApplication().getId())
            .studentId(entity.getApplication().getStudent().getId())
            .studentName(entity.getApplication().getStudent().getFullName())
            .jobTitle(entity.getApplication().getJob().getTitle())
            .companyName(entity.getApplication().getJob().getCompany().getCompanyName())
            .proposedMentorId(entity.getProposedMentor() != null ? entity.getProposedMentor().getId() : null)
            .proposedMentorName(entity.getProposedMentor() != null ? entity.getProposedMentor().getFullName() : null)
            .startDate(entity.getStartDate())
            .endDate(entity.getEndDate())
            .stipend(entity.getStipend())
            .termsSnapshot(entity.getTermsSnapshot())
            .expiresAt(entity.getExpiresAt())
            .status(entity.getStatus())
            .respondedAt(entity.getRespondedAt())
            .createdAt(entity.getCreatedAt())
            .build();
    }
}
