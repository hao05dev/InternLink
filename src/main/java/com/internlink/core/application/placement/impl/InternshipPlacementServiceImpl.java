package com.internlink.core.application.placement.impl;

import com.internlink.core.application.placement.InternshipPlacementService;
import com.internlink.core.domain.auth.User;
import com.internlink.core.domain.placement.InternshipPlacement;
import com.internlink.core.domain.placement.LearningAgreement;
import com.internlink.core.domain.student.StudentProfile;
import com.internlink.core.infrastructure.persistence.jpa.*;
import com.internlink.core.presentation.placement.dto.response.InternshipPlacementResponse;
import com.internlink.core.shared.enums.AgreementStatus;
import com.internlink.core.shared.enums.PlacementStatus;
import com.internlink.core.shared.exception.BadRequestException;
import com.internlink.core.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class InternshipPlacementServiceImpl implements InternshipPlacementService {

    private final JpaInternshipPlacementRepository placementRepository;
    private final JpaLearningAgreementRepository agreementRepository;
    private final JpaUserRepository userRepository;
    private final JpaStudentProfileRepository studentProfileRepository;
    private final JpaFinalResultRepository finalResultRepository;

    // ── State Machine: chuyển trạng thái hợp lệ cho Placement ───────────────
    //
    //   PREPARING → ACTIVE → PAUSED → ACTIVE (được phép đảo lại)
    //   ACTIVE    → COMPLETED | TERMINATED | TRANSFERRED
    //   PAUSED    → TERMINATED | TRANSFERRED
    //
    // Sơ đồ:
    //   PREPARING ──► ACTIVE ──► COMPLETED
    //                   │ ▲         (cuối)
    //                   │ │
    //                 PAUSED ──► TERMINATED | TRANSFERRED
    //                              (cuối)
    private static final Map<PlacementStatus, Set<PlacementStatus>> VALID_TRANSITIONS = Map.of(
        PlacementStatus.PREPARING,    Set.of(PlacementStatus.ACTIVE),
        PlacementStatus.ACTIVE,       Set.of(PlacementStatus.PAUSED,
                                             PlacementStatus.COMPLETED,
                                             PlacementStatus.TERMINATED,
                                             PlacementStatus.TRANSFERRED),
        PlacementStatus.PAUSED,       Set.of(PlacementStatus.ACTIVE,
                                             PlacementStatus.TERMINATED,
                                             PlacementStatus.TRANSFERRED),
        PlacementStatus.COMPLETED,    Set.of(), // trạng thái cuối
        PlacementStatus.TERMINATED,   Set.of(), // trạng thái cuối
        PlacementStatus.TRANSFERRED,  Set.of()  // trạng thái cuối
    );

    @Override
    @Transactional(readOnly = true)
    public List<InternshipPlacementResponse> getPlacementsByTerm(UUID termId) {
        return placementRepository.findByTermId(termId).stream()
            .map(this::mapToResponse)
            .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<InternshipPlacementResponse> getPlacementsByStudent(UUID studentId) {
        return placementRepository.findByStudentId(studentId).stream()
            .map(this::mapToResponse)
            .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<InternshipPlacementResponse> getPlacementsByMentor(UUID mentorId) {
        return placementRepository.findByMentorId(mentorId).stream()
            .map(this::mapToResponse)
            .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<InternshipPlacementResponse> getPlacementsByLecturer(UUID lecturerId) {
        return placementRepository.findByLecturerId(lecturerId).stream()
            .map(this::mapToResponse)
            .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public InternshipPlacementResponse getPlacementById(UUID id) {
        InternshipPlacement placement = placementRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("InternshipPlacement", "id", id));
        return mapToResponse(placement);
    }

    @Override
    @Transactional
    public InternshipPlacementResponse activatePlacementFromAgreement(UUID agreementId, UUID lecturerId) {
        LearningAgreement agreement = agreementRepository.findById(agreementId)
            .orElseThrow(() -> new ResourceNotFoundException("LearningAgreement", "id", agreementId));

        if (agreement.getStatus() != AgreementStatus.APPROVED) {
            throw new BadRequestException("Thỏa thuận 3 bên phải được phê duyệt (APPROVED) trước khi kích hoạt thực tập");
        }

        if (placementRepository.findByAgreementId(agreementId).isPresent()) {
            throw new BadRequestException("Lần thực tập đã được kích hoạt từ thỏa thuận này rồi");
        }

        User lecturer = userRepository.findById(lecturerId)
            .orElseThrow(() -> new ResourceNotFoundException("User", "id", lecturerId));

        User mentor = agreement.getOffer().getProposedMentor();
        if (mentor == null) {
            throw new BadRequestException("Offer chưa được chỉ định Mentor doanh nghiệp");
        }

        InternshipPlacement placement = InternshipPlacement.builder()
            .agreement(agreement)
            .student(agreement.getStudent())
            .company(agreement.getCompany())
            .mentor(mentor)
            .lecturer(lecturer)
            .term(agreement.getOffer().getApplication().getJob().getTerm())
            .startDate(agreement.getOffer().getStartDate())
            .endDate(agreement.getOffer().getEndDate())
            .totalHoursWorked(BigDecimal.ZERO)
            .status(PlacementStatus.PREPARING) // bắt đầu ở PREPARING, chờ kích hoạt ACTIVE
            .workSchedule(Map.of())
            .build();

        return mapToResponse(placementRepository.save(placement));
    }

    /**
     * Chuyển trạng thái placement theo State Machine có kiểm soát.
     *
     * <p>Điều kiện tiên quyết theo từng bước đích:
     * <ul>
     *   <li>COMPLETED: placement phải có FinalResult được công bố</li>
     *   <li>TERMINATED: cho phép tự do (do sự cố, chấm dứt sớm)</li>
     *   <li>TRANSFERRED: cho phép tự do (chuyển đơn vị)</li>
     * </ul>
     * </p>
     */
    @Override
    @Transactional
    public InternshipPlacementResponse updatePlacementStatus(UUID id, PlacementStatus newStatus) {
        InternshipPlacement placement = placementRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("InternshipPlacement", "id", id));

        PlacementStatus currentStatus = placement.getStatus();

        // ── 1. Kiểm tra chuyển trạng thái có hợp lệ theo State Machine không ──
        Set<PlacementStatus> allowed = VALID_TRANSITIONS.getOrDefault(currentStatus, Set.of());
        if (!allowed.contains(newStatus)) {
            throw new BadRequestException(String.format(
                "Không thể chuyển trạng thái thực tập từ %s sang %s. Các trạng thái hợp lệ: %s",
                currentStatus, newStatus, allowed.isEmpty() ? "không có (trạng thái cuối)" : allowed
            ));
        }

        // ── 2. Điều kiện tiên quyết theo bước đích ───────────────────────────
        if (newStatus == PlacementStatus.COMPLETED) {
            // Phải có FinalResult đã được công bố trước khi COMPLETED
            boolean hasFinalResult = finalResultRepository.findByPlacementId(id)
                .map(r -> r.getPublishedAt() != null)
                .orElse(false);
            if (!hasFinalResult) {
                throw new BadRequestException(
                    "Phải có kết quả thực tập đã công bố (FinalResult.publishedAt != null) trước khi đánh dấu COMPLETED"
                );
            }
        }

        placement.setStatus(newStatus);
        return mapToResponse(placementRepository.save(placement));
    }

    private InternshipPlacementResponse mapToResponse(InternshipPlacement entity) {
        String studentCode = studentProfileRepository.findById(entity.getStudent().getId())
            .map(StudentProfile::getStudentCode)
            .orElse(null);

        return InternshipPlacementResponse.builder()
            .id(entity.getId())
            .agreementId(entity.getAgreement().getId())
            .studentId(entity.getStudent().getId())
            .studentName(entity.getStudent().getFullName())
            .studentCode(studentCode)
            .companyId(entity.getCompany().getId())
            .companyName(entity.getCompany().getCompanyName())
            .mentorId(entity.getMentor().getId())
            .mentorName(entity.getMentor().getFullName())
            .lecturerId(entity.getLecturer().getId())
            .lecturerName(entity.getLecturer().getFullName())
            .termId(entity.getTerm().getId())
            .termName(entity.getTerm().getTermName())
            .workSchedule(entity.getWorkSchedule())
            .startDate(entity.getStartDate())
            .endDate(entity.getEndDate())
            .totalHoursWorked(entity.getTotalHoursWorked())
            .status(entity.getStatus())
            .createdAt(entity.getCreatedAt())
            .build();
    }
}