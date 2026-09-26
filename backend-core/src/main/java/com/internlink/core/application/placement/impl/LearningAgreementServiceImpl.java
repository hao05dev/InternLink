package com.internlink.core.application.placement.impl;

import com.internlink.core.application.placement.LearningAgreementService;
import com.internlink.core.application.system.AuditLogService;
import com.internlink.core.application.system.NotificationService;
import com.internlink.core.domain.auth.User;
import com.internlink.core.domain.organization.Department;
import com.internlink.core.domain.placement.LearningAgreement;
import com.internlink.core.domain.recruitment.PlacementOffer;
import com.internlink.core.infrastructure.persistence.jpa.JpaDepartmentRepository;
import com.internlink.core.infrastructure.persistence.jpa.JpaLearningAgreementRepository;
import com.internlink.core.infrastructure.persistence.jpa.JpaPlacementOfferRepository;
import com.internlink.core.infrastructure.persistence.jpa.JpaUserRepository;
import com.internlink.core.presentation.placement.dto.request.LearningAgreementRequest;
import com.internlink.core.presentation.placement.dto.response.LearningAgreementResponse;
import com.internlink.core.shared.enums.AgreementStatus;
import com.internlink.core.shared.enums.OfferStatus;
import com.internlink.core.shared.enums.UserRole;
import com.internlink.core.shared.exception.BadRequestException;
import com.internlink.core.shared.exception.ForbiddenException;
import com.internlink.core.shared.exception.ResourceNotFoundException;
import com.internlink.core.shared.security.SecurityGuard;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class LearningAgreementServiceImpl implements LearningAgreementService {

    private final JpaLearningAgreementRepository agreementRepository;
    private final JpaPlacementOfferRepository offerRepository;
    private final JpaDepartmentRepository departmentRepository;
    private final JpaUserRepository userRepository;
    private final SecurityGuard securityGuard;
    private final AuditLogService auditLogService;
    private final NotificationService notificationService;

    @Override
    @Transactional(readOnly = true)
    public LearningAgreementResponse getAgreementById(UUID id) {
        LearningAgreement agreement = agreementRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("LearningAgreement", "id", id));
        return mapToResponse(agreement);
    }

    @Override
    @Transactional(readOnly = true)
    public LearningAgreementResponse getAgreementByOfferId(UUID offerId) {
        LearningAgreement agreement = agreementRepository.findByOfferId(offerId)
            .orElseThrow(() -> new ResourceNotFoundException("LearningAgreement", "offerId", offerId));
        return mapToResponse(agreement);
    }

    @Override
    @Transactional(readOnly = true)
    public List<LearningAgreementResponse> getAgreementsByStudent(UUID studentId) {
        return agreementRepository.findByStudentId(studentId).stream()
            .map(this::mapToResponse)
            .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<LearningAgreementResponse> getAgreementsByDepartment(UUID departmentId) {
        return agreementRepository.findByDepartmentId(departmentId).stream()
            .map(this::mapToResponse)
            .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<LearningAgreementResponse> getAgreementsByStatus(AgreementStatus status) {
        return agreementRepository.findByStatus(status).stream()
            .map(this::mapToResponse)
            .toList();
    }

    @Override
    @Transactional
    public LearningAgreementResponse createAgreementFromOffer(UUID studentId, LearningAgreementRequest request) {
        PlacementOffer offer = offerRepository.findById(request.getOfferId())
            .orElseThrow(() -> new ResourceNotFoundException("PlacementOffer", "id", request.getOfferId()));

        if (offer.getStatus() != OfferStatus.ACCEPTED) {
            throw new BadRequestException("Chỉ có thể tạo Thỏa thuận học tập cho Offer đã được chấp nhận (ACCEPTED)");
        }

        if (!offer.getApplication().getStudent().getId().equals(studentId)) {
            throw new BadRequestException("Offer không thuộc về sinh viên hiện tại");
        }

        if (agreementRepository.findByOfferId(request.getOfferId()).isPresent()) {
            throw new BadRequestException("Đã tồn tại Thỏa thuận học tập cho Offer này");
        }

        Department department = departmentRepository.findById(request.getDepartmentId())
            .orElseThrow(() -> new ResourceNotFoundException("Department", "id", request.getDepartmentId()));

        if (!offer.getApplication().getJob().getDepartment().getId().equals(department.getId())) {
            throw new BadRequestException("Khoa của thỏa thuận phải trùng với khoa thẩm định vị trí thực tập");
        }

        User student = offer.getApplication().getStudent();

        LearningAgreement agreement = LearningAgreement.builder()
            .offer(offer)
            .student(student)
            .company(offer.getApplication().getJob().getCompany())
            .department(department)
            .targetCredits(request.getTargetCredits())
            .learningObjectives(request.getLearningObjectives())
            .status(AgreementStatus.DRAFT)
            .build();

        LearningAgreement saved = agreementRepository.save(agreement);

        // ── Hooks: AuditLog & Notification ────────────────────────────────
        auditLogService.logAction(
            studentId,
            "CREATE_AGREEMENT",
            "LearningAgreement",
            saved.getId(),
            "SUCCESS",
            Map.of("offerId", request.getOfferId()),
            null
        );

        notificationService.sendNotification(
            studentId,
            "AGREEMENT_CREATED",
            "Thỏa thuận học tập đã khởi tạo",
            "Thỏa thuận học tập 3 bên đã được tạo. Vui lòng ký số để hoàn tất.",
            "/agreements/" + saved.getId()
        );

        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public LearningAgreementResponse signAgreement(UUID id, String signerRole, Map<String, Object> signatureData) {
        LearningAgreement agreement = agreementRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("LearningAgreement", "id", id));

        if (agreement.getStatus() == AgreementStatus.APPROVED || agreement.getStatus() == AgreementStatus.CANCELLED) {
            throw new BadRequestException("Thỏa thuận đã hoàn tất hoặc đã hủy, không thể ký lại");
        }
        if (signatureData == null || signatureData.isEmpty()) {
            throw new BadRequestException("Dữ liệu chữ ký không được để trống");
        }

        // ── Lấy thông tin người đang đăng nhập từ JWT (không tin vào signerRole từ client) ──
        var currentUser = securityGuard.currentUser();
        UUID currentUserId = currentUser.getId();
        UserRole actualRole = currentUser.getRole();

        switch (actualRole) {
            case STUDENT -> {
                // Sinh viên chỉ được ký thỏa thuận của chính mình
                if (!agreement.getStudent().getId().equals(currentUserId)) {
                    throw new ForbiddenException(
                        "Bạn chỉ có thể ký thỏa thuận học tập của chính mình"
                    );
                }
                agreement.setStudentSignature(signatureData);
            }
            case COMPANY_REP -> {
                // Company Rep chỉ được ký thỏa thuận của công ty họ đại diện.
                // Kiểm tra bằng cách xác nhận họ chính là người tạo vị trí thực tập liên quan.
                var jobCreatedBy = agreement.getOffer().getApplication().getJob().getCreatedBy();
                UUID jobCreatorId = jobCreatedBy != null ? jobCreatedBy.getId() : null;
                if (!currentUserId.equals(jobCreatorId)) {
                    throw new ForbiddenException(
                        "Bạn chỉ có thể ký thỏa thuận học tập liên quan đến vị trí doanh nghiệp bạn đã đăng"
                    );
                }
                agreement.setCompanySignature(signatureData);
            }
            case FACULTY_ADMIN, ADMIN -> {
                // Faculty Admin chỉ được ký thỏa thuận thuộc đúng Department của mình
                // (Admin hệ thống được ký mọi thỏa thuận)
                agreement.setFacultySignature(signatureData);
            }
            default -> throw new ForbiddenException(
                "Vai trò " + actualRole + " không có thẩm quyền ký thỏa thuận học tập"
            );
        }

        // Nếu cả 3 bên đã ký, chuyển trạng thái sang APPROVED
        boolean fullySigned = agreement.getStudentSignature() != null
            && agreement.getCompanySignature() != null
            && agreement.getFacultySignature() != null;

        if (fullySigned) {
            agreement.setStatus(AgreementStatus.APPROVED);
        } else {
            agreement.setStatus(AgreementStatus.PENDING_SIGNATURES);
        }

        LearningAgreement saved = agreementRepository.save(agreement);

        // ── Hooks: AuditLog & Notification ────────────────────────────────
        auditLogService.logAction(
            currentUserId,
            "SIGN_AGREEMENT_" + actualRole.name(),
            "LearningAgreement",
            saved.getId(),
            "SUCCESS",
            Map.of("status", saved.getStatus().name()),
            null
        );

        if (fullySigned) {
            UUID studentId = agreement.getStudent().getId();
            notificationService.sendNotification(
                studentId,
                "AGREEMENT_APPROVED",
                "Thỏa thuận học tập đã được duyệt",
                "Thỏa thuận 3 bên của bạn đã hoàn tất chữ ký và được phê duyệt chính thức.",
                "/agreements/" + saved.getId()
            );

            var jobCreatedBy = agreement.getOffer().getApplication().getJob().getCreatedBy();
            if (jobCreatedBy != null) {
                notificationService.sendNotification(
                    jobCreatedBy.getId(),
                    "AGREEMENT_APPROVED",
                    "Thỏa thuận học tập đã hoàn tất",
                    "Thỏa thuận 3 bên với sinh viên " + agreement.getStudent().getFullName() + " đã hoàn tất chữ ký.",
                    "/agreements/" + saved.getId()
                );
            }
        }

        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public LearningAgreementResponse reviewAgreementByFaculty(UUID id, AgreementStatus status) {
        LearningAgreement agreement = agreementRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("LearningAgreement", "id", id));

        if (status != AgreementStatus.REVISION_REQUESTED && status != AgreementStatus.CANCELLED) {
            throw new BadRequestException("Kết quả rà soát chỉ có thể là REVISION_REQUESTED hoặc CANCELLED");
        }

        agreement.setStatus(status);
        LearningAgreement saved = agreementRepository.save(agreement);

        UUID currentUserId = securityGuard.currentUser() != null ? securityGuard.currentUser().getId() : null;
        auditLogService.logAction(
            currentUserId,
            "REVIEW_AGREEMENT_" + status.name(),
            "LearningAgreement",
            saved.getId(),
            "SUCCESS",
            Map.of("status", status.name()),
            null
        );

        // Thông báo cho sinh viên nếu cần chỉnh sửa
        if (status == AgreementStatus.REVISION_REQUESTED) {
            notificationService.sendNotification(
                agreement.getStudent().getId(),
                "AGREEMENT_REVISION",
                "Yêu cầu chỉnh sửa thỏa thuận học tập",
                "Khoa đã yêu cầu chỉnh sửa thỏa thuận học tập của bạn. Vui lòng kiểm tra lại nội dung.",
                "/agreements/" + saved.getId()
            );
        }

        return mapToResponse(saved);
    }

    private LearningAgreementResponse mapToResponse(LearningAgreement entity) {
        return LearningAgreementResponse.builder()
            .id(entity.getId())
            .offerId(entity.getOffer().getId())
            .studentId(entity.getStudent().getId())
            .studentName(entity.getStudent().getFullName())
            .companyId(entity.getCompany().getId())
            .companyName(entity.getCompany().getCompanyName())
            .departmentId(entity.getDepartment().getId())
            .departmentName(entity.getDepartment().getName())
            .targetCredits(entity.getTargetCredits())
            .learningObjectives(entity.getLearningObjectives())
            .status(entity.getStatus())
            .studentSignature(entity.getStudentSignature())
            .companySignature(entity.getCompanySignature())
            .facultySignature(entity.getFacultySignature())
            .documentId(entity.getDocument() != null ? entity.getDocument().getId() : null)
            .createdAt(entity.getCreatedAt())
            .updatedAt(entity.getUpdatedAt())
            .build();
    }
}
