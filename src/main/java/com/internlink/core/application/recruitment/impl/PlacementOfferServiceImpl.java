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
import com.internlink.core.shared.security.SecurityGuard;
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
    private final SecurityGuard securityGuard;

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

        if (application.getStatus() != ApplicationStatus.REVIEWING
            && application.getStatus() != ApplicationStatus.INTERVIEWING) {
            throw new BadRequestException("Chỉ có thể phát hành Offer cho hồ sơ đang được xem xét hoặc phỏng vấn");
        }

        if (request.getStartDate().isAfter(request.getEndDate())) {
            throw new BadRequestException("Ngày bắt đầu Offer phải trước hoặc bằng ngày kết thúc");
        }

        if (!request.getExpiresAt().isAfter(OffsetDateTime.now())) {
            throw new BadRequestException("Thời hạn phản hồi Offer phải ở tương lai");
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
    @Transactional(noRollbackFor = BadRequestException.class)
    public PlacementOfferResponse respondToOffer(UUID id, OfferStatus status) {
        // ── Bước 1: Xác minh người đang đăng nhập là sinh viên chủ của offer ──
        UUID currentUserId = securityGuard.currentUser().getId();

        PlacementOffer offer = offerRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("PlacementOffer", "id", id));

        UUID offerOwnerStudentId = offer.getApplication().getStudent().getId();
        securityGuard.requireSelf(currentUserId, offerOwnerStudentId,
            "Offer #" + id + " — chỉ sinh viên nhận offer mới được phản hồi");

        if (offer.getStatus() != OfferStatus.SENT) {
            throw new BadRequestException("Offer này đã được phản hồi hoặc không còn hiệu lực");
        }

        if (status != OfferStatus.ACCEPTED && status != OfferStatus.DECLINED) {
            throw new BadRequestException("Sinh viên chỉ có thể ACCEPTED hoặc DECLINED Offer");
        }

        if (OffsetDateTime.now().isAfter(offer.getExpiresAt())) {
            offer.setStatus(OfferStatus.EXPIRED);
            offerRepository.save(offer);
            throw new BadRequestException("Offer đã hết hạn phản hồi");
        }

        offer.setStatus(status);
        offer.setRespondedAt(OffsetDateTime.now());

        if (status == OfferStatus.DECLINED) {
            offer.getApplication().setStatus(ApplicationStatus.REJECTED);
            applicationRepository.save(offer.getApplication());
        }

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
