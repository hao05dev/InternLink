package com.internlink.core.application.recruitment.impl;

import com.internlink.core.application.placement.PlacementEligibilityService;
import com.internlink.core.application.recruitment.PlacementOfferService;
import com.internlink.core.application.system.AuditLogService;
import com.internlink.core.application.system.NotificationService;
import com.internlink.core.domain.auth.User;
import com.internlink.core.domain.recruitment.JobApplication;
import com.internlink.core.domain.recruitment.JobPosition;
import com.internlink.core.domain.recruitment.PlacementOffer;
import com.internlink.core.infrastructure.persistence.jpa.JpaJobApplicationRepository;
import com.internlink.core.infrastructure.persistence.jpa.JpaJobPositionRepository;
import com.internlink.core.infrastructure.persistence.jpa.JpaPlacementOfferRepository;
import com.internlink.core.infrastructure.persistence.jpa.JpaStudentRosterRepository;
import com.internlink.core.infrastructure.persistence.jpa.JpaUserRepository;
import com.internlink.core.presentation.recruitment.dto.request.PlacementOfferRequest;
import com.internlink.core.presentation.recruitment.dto.response.PlacementOfferResponse;
import com.internlink.core.shared.enums.ApplicationStatus;
import com.internlink.core.shared.enums.JobStatus;
import com.internlink.core.shared.enums.JobType;
import com.internlink.core.shared.enums.OfferStatus;
import com.internlink.core.shared.exception.BadRequestException;
import com.internlink.core.shared.exception.ResourceNotFoundException;
import com.internlink.core.shared.security.ResourceAuthorization;
import com.internlink.core.shared.security.SecurityGuard;
import com.internlink.core.shared.security.TermGuard;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
public class PlacementOfferServiceImpl implements PlacementOfferService {

    private final JpaPlacementOfferRepository offerRepository;
    private final JpaJobApplicationRepository applicationRepository;
    private final JpaJobPositionRepository jobPositionRepository;
    private final JpaStudentRosterRepository rosterRepository;
    private final JpaUserRepository userRepository;
    private final PlacementEligibilityService placementEligibility;
    private final SecurityGuard securityGuard;
    private final AuditLogService auditLogService;
    private final NotificationService notificationService;
    private final RedisJobSlotService redisJobSlotService;

    public PlacementOfferServiceImpl(
            JpaPlacementOfferRepository offerRepository,
            JpaJobApplicationRepository applicationRepository,
            JpaJobPositionRepository jobPositionRepository,
            JpaStudentRosterRepository rosterRepository,
            JpaUserRepository userRepository,
            PlacementEligibilityService placementEligibility,
            SecurityGuard securityGuard,
            AuditLogService auditLogService,
            NotificationService notificationService) {
        this(offerRepository, applicationRepository, jobPositionRepository, rosterRepository,
                userRepository, placementEligibility, securityGuard, auditLogService, notificationService,
                new RedisJobSlotService(null, false));
    }

    @Autowired
    public PlacementOfferServiceImpl(
            JpaPlacementOfferRepository offerRepository,
            JpaJobApplicationRepository applicationRepository,
            JpaJobPositionRepository jobPositionRepository,
            JpaStudentRosterRepository rosterRepository,
            JpaUserRepository userRepository,
            PlacementEligibilityService placementEligibility,
            SecurityGuard securityGuard,
            AuditLogService auditLogService,
            NotificationService notificationService,
            @Autowired(required = false) RedisJobSlotService redisJobSlotService) {
        this.offerRepository = offerRepository;
        this.applicationRepository = applicationRepository;
        this.jobPositionRepository = jobPositionRepository;
        this.rosterRepository = rosterRepository;
        this.userRepository = userRepository;
        this.placementEligibility = placementEligibility;
        this.securityGuard = securityGuard;
        this.auditLogService = auditLogService;
        this.notificationService = notificationService;
        this.redisJobSlotService = redisJobSlotService != null ? redisJobSlotService : new RedisJobSlotService(null, false);
    }

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
        TermGuard.requireNotClosed(application.getJob().getTerm());
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

        // Khóa bi quan (PESSIMISTIC_WRITE) dòng JobPosition kết hợp Redis Pre-allocation
        JobPosition lockedJob = jobPositionRepository.findByIdForUpdate(application.getJob().getId())
            .orElseThrow(() -> new ResourceNotFoundException("JobPosition", "id", application.getJob().getId()));

        long reserved = offerRepository.countReservedPlaces(lockedJob.getId(), OffsetDateTime.now());
        long remaining = lockedJob.getVacancies() - reserved;
        if (remaining <= 0 || !redisJobSlotService.tryAcquireSlot(lockedJob.getId(), remaining)) {
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

        application.setStatus(ApplicationStatus.OFFERED);
        applicationRepository.save(application);

        PlacementOffer saved = offerRepository.save(offer);

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
        UUID currentUserId = securityGuard.currentUser().getId();

        PlacementOffer offer = offerRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("PlacementOffer", "id", id));
        TermGuard.requireNotClosed(offer.getApplication().getJob().getTerm());

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

        var term = offer.getApplication().getJob().getTerm();
        boolean isFresher = offer.getApplication().getJob().getJobType() == JobType.FRESHER;

        if (status == OfferStatus.ACCEPTED) {
            if (term != null) {
                // Khóa dòng roster của sinh viên trong kỳ để tuần tự hóa và chống race condition
                rosterRepository.findByTermIdAndClaimedUserIdForUpdate(term.getId(), offerOwnerStudentId)
                    .ifPresent(r -> log.debug("Locked student roster {} in term {}", r.getId(), term.getId()));

                if (!isFresher) {
                    // Luật INTERNSHIP: chỉ 1 offer accepted và 1 placement active mỗi kỳ
                    placementEligibility.requireNoAcceptedOffer(offerOwnerStudentId, term.getId(), offer.getId());
                    placementEligibility.requireNoLivePlacement(offerOwnerStudentId, term.getId());

                    // Tự động từ chối các Offer SENT khác của SV trong kỳ
                    List<PlacementOffer> otherSentOffers = offerRepository.findOtherSentOffersByStudentAndTerm(
                        offerOwnerStudentId, term.getId(), offer.getId());
                    for (PlacementOffer other : otherSentOffers) {
                        other.setStatus(OfferStatus.DECLINED);
                        other.setRespondedAt(OffsetDateTime.now());
                        offerRepository.save(other);

                        notifyOfferDeclinedAuto(other);
                    }

                    // Tự động chuyển các JobApplication đang active khác sang WITHDRAWN
                    List<JobApplication> otherApps = applicationRepository.findOtherActiveApplicationsByStudentAndTerm(
                        offerOwnerStudentId, term.getId(), offer.getApplication().getId());
                    for (JobApplication otherApp : otherApps) {
                        otherApp.setStatus(ApplicationStatus.WITHDRAWN);
                        applicationRepository.save(otherApp);

                        notifyApplicationWithdrawnAuto(otherApp);
                    }
                }
            }

            offer.setStatus(OfferStatus.ACCEPTED);
            offer.setRespondedAt(OffsetDateTime.now());
        } else {
            offer.setStatus(OfferStatus.DECLINED);
            offer.setRespondedAt(OffsetDateTime.now());
            offer.getApplication().setStatus(ApplicationStatus.REJECTED);
            applicationRepository.save(offer.getApplication());
            redisJobSlotService.releaseSlot(offer.getApplication().getJob().getId());
        }

        PlacementOffer saved = offerRepository.save(offer);

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

    private void notifyOfferDeclinedAuto(PlacementOffer other) {
        User creator = other.getApplication().getJob().getCreatedBy();
        if (creator != null) {
            notificationService.sendNotification(
                creator.getId(),
                "OFFER_DECLINED_AUTO",
                "Lời mời thực tập tự động hủy",
                "Sinh viên " + other.getApplication().getStudent().getFullName()
                    + " đã chấp nhận một đề nghị thực tập khác trong kỳ này.",
                "/offers/" + other.getId()
            );
        }
    }

    private void notifyApplicationWithdrawnAuto(JobApplication otherApp) {
        User creator = otherApp.getJob().getCreatedBy();
        if (creator != null) {
            notificationService.sendNotification(
                creator.getId(),
                "APPLICATION_WITHDRAWN_AUTO",
                "Hồ sơ ứng tuyển tự động rút",
                "Sinh viên " + otherApp.getStudent().getFullName()
                    + " đã chấp nhận một lời mời thực tập khác trong kỳ.",
                "/company/candidates"
            );
        }
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
