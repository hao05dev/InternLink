package com.internlink.core.application.recruitment.impl;

import com.internlink.core.application.recruitment.PlacementOfferService;
import com.internlink.core.application.system.AuditLogService;
import com.internlink.core.application.system.NotificationService;
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
import com.internlink.core.shared.enums.JobStatus;
import com.internlink.core.shared.exception.BadRequestException;
import com.internlink.core.shared.exception.ResourceNotFoundException;
import com.internlink.core.shared.security.ResourceAuthorization;
import com.internlink.core.shared.security.SecurityGuard;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class PlacementOfferServiceImpl implements PlacementOfferService {

    private final JpaPlacementOfferRepository offerRepository;
    private final JpaJobApplicationRepository applicationRepository;
    private final JpaUserRepository userRepository;
    private final SecurityGuard securityGuard;
    private final AuditLogService auditLogService;
    private final NotificationService notificationService;

    @Override
    @Transactional(readOnly = true)
    public PlacementOfferResponse getOfferByApplicationId(UUID applicationId) {
        PlacementOffer offer = offerRepository.findByApplicationId(applicationId)
            .orElseThrow(() -> new ResourceNotFoundException("PlacementOffer", "applicationId", applicationId));
        ResourceAuthorization.require(ResourceAuthorization.canReadApplication(currentActor(), offer.getApplication()));
        return mapToResponse(offer);
    }

    @Override
    @Transactional(readOnly = true)
    public PlacementOfferResponse getOfferById(UUID id) {
        PlacementOffer offer = offerRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("PlacementOffer", "id", id));
        ResourceAuthorization.require(ResourceAuthorization.canReadApplication(currentActor(), offer.getApplication()));
        return mapToResponse(offer);
    }

    @Override
    @Transactional
    public PlacementOfferResponse createOffer(PlacementOfferRequest request) {
        JobApplication application = applicationRepository.findById(request.getApplicationId())
            .orElseThrow(() -> new ResourceNotFoundException("JobApplication", "id", request.getApplicationId()));
        User actor = currentActor();
        ResourceAuthorization.require(ResourceAuthorization.isAdmin(actor)
            || ResourceAuthorization.representsCompany(actor, application.getJob().getCompany().getId()));

        if (offerRepository.findByApplicationId(request.getApplicationId()).isPresent()) {
            throw new BadRequestException("Đã phát hành Offer cho đơn ứng tuyển này rồi");
        }

        if (application.getStatus() != ApplicationStatus.REVIEWING
            && application.getStatus() != ApplicationStatus.INTERVIEWING) {
            throw new BadRequestException("Chỉ có thể phát hành Offer khi hồ sơ ở trạng thái REVIEWING hoặc INTERVIEWING");
        }
        if (application.getJob().getStatus() != JobStatus.APPROVED) {
            throw new BadRequestException("Vị trí thực tập không còn được duyệt để phát hành offer");
        }
        if (request.getProposedMentorId() == null) {
            throw new BadRequestException("Cần chỉ định Mentor doanh nghiệp trước khi phát hành offer");
        }
        if (offerRepository.countReservedPlaces(application.getJob().getId(), OffsetDateTime.now())
            >= application.getJob().getVacancies()) {
            throw new BadRequestException("Vị trí đã đủ số chỗ được giữ bởi các offer còn hiệu lực");
        }

        User mentor = null;
        if (request.getProposedMentorId() != null) {
            mentor = userRepository.findById(request.getProposedMentorId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", request.getProposedMentorId()));
            ResourceAuthorization.require(mentor.getRole() == com.internlink.core.shared.enums.UserRole.COMPANY_MENTOR
                && mentor.getCompany() != null
                && mentor.getCompany().getId().equals(application.getJob().getCompany().getId()));
        }

        if (request.getStartDate().isAfter(request.getEndDate())) {
            throw new BadRequestException("Ngày bắt đầu thực tập phải trước ngày kết thúc");
        }

        if (request.getExpiresAt().isBefore(OffsetDateTime.now())) {
            throw new BadRequestException("Thời hạn phản hồi Offer phải ở tương lai");
        }

        PlacementOffer offer = PlacementOffer.builder()
            .application(application)
            .proposedMentor(mentor)
            .startDate(request.getStartDate())
            .endDate(request.getEndDate())
            .stipend(request.getStipend())
            .termsSnapshot(request.getTermsSnapshot() != null ? request.getTermsSnapshot() : Map.of())
            .expiresAt(request.getExpiresAt())
            .status(OfferStatus.SENT)
            .build();

        // Cập nhật trạng thái đơn ứng tuyển sang OFFERED
        application.setStatus(ApplicationStatus.OFFERED);
        applicationRepository.save(application);

        PlacementOffer saved = offerRepository.save(offer);

        // ── Hooks: AuditLog & Notification ────────────────────────────────
        UUID studentId = application.getStudent().getId();
        String jobTitle = application.getJob().getTitle();
        String companyName = application.getJob().getCompany().getCompanyName();

        auditLogService.logAction(
            actor.getId(),
            "CREATE_OFFER",
            "PlacementOffer",
            saved.getId(),
            "SUCCESS",
            Map.of("studentId", studentId, "jobTitle", jobTitle, "companyName", companyName),
            null
        );

        notificationService.sendNotification(
            studentId,
            "OFFER_RECEIVED",
            "Lời mời thực tập mới",
            "Bạn nhận được lời mời thực tập cho vị trí '" + jobTitle + "' từ " + companyName,
            "/offers/" + saved.getId()
        );

        return mapToResponse(saved);
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

        PlacementOffer saved = offerRepository.save(offer);

        // ── Hooks: AuditLog & Notification ────────────────────────────────
        auditLogService.logAction(
            currentUserId,
            "RESPOND_OFFER_" + status.name(),
            "PlacementOffer",
            saved.getId(),
            "SUCCESS",
            Map.of("responseStatus", status.name()),
            null
        );

        User jobCreator = offer.getApplication().getJob().getCreatedBy();
        if (jobCreator != null) {
            String studentName = offer.getApplication().getStudent().getFullName();
            String jobTitle = offer.getApplication().getJob().getTitle();
            String actionDesc = status == OfferStatus.ACCEPTED ? "chấp nhận" : "từ chối";

            notificationService.sendNotification(
                jobCreator.getId(),
                "OFFER_RESPONSE",
                "Sinh viên " + actionDesc + " lời mời thực tập",
                "Sinh viên " + studentName + " đã " + actionDesc + " offer vị trí '" + jobTitle + "'.",
                "/offers/" + saved.getId()
            );
        }

        return mapToResponse(saved);
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
            .status(entity.getStatus())
            .expiresAt(entity.getExpiresAt())
            .respondedAt(entity.getRespondedAt())
            .createdAt(entity.getCreatedAt())
            .build();
    }

    private User currentActor() {
        UUID actorId = securityGuard.currentUser().getId();
        return userRepository.findById(actorId)
            .orElseThrow(() -> new ResourceNotFoundException("User", "id", actorId));
    }
}
