package com.internlink.core.application.placement.impl;

import com.internlink.core.application.placement.LearningAgreementService;
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
import com.internlink.core.shared.exception.BadRequestException;
import com.internlink.core.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class LearningAgreementServiceImpl implements LearningAgreementService {

    private final JpaLearningAgreementRepository agreementRepository;
    private final JpaPlacementOfferRepository offerRepository;
    private final JpaDepartmentRepository departmentRepository;
    private final JpaUserRepository userRepository;

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
    public List<LearningAgreementResponse> getAgreementsByDepartment(UUID departmentId, AgreementStatus status) {
        if (status != null) {
            return agreementRepository.findByDepartmentIdAndStatus(departmentId, status).stream()
                .map(this::mapToResponse)
                .toList();
        }
        return agreementRepository.findByDepartmentId(departmentId).stream()
            .map(this::mapToResponse)
            .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<LearningAgreementResponse> getAgreementsByStudent(UUID studentId) {
        return agreementRepository.findByStudentId(studentId).stream()
            .map(this::mapToResponse)
            .toList();
    }

    @Override
    @Transactional
    public LearningAgreementResponse createAgreement(UUID studentId, LearningAgreementRequest request) {
        PlacementOffer offer = offerRepository.findById(request.getOfferId())
            .orElseThrow(() -> new ResourceNotFoundException("PlacementOffer", "id", request.getOfferId()));

        if (offer.getStatus() != OfferStatus.ACCEPTED) {
            throw new BadRequestException("Chỉ có thể tạo Thỏa thuận học tập cho Offer đã được chấp nhận (ACCEPTED)");
        }

        if (agreementRepository.findByOfferId(request.getOfferId()).isPresent()) {
            throw new BadRequestException("Đã tồn tại Thỏa thuận học tập cho Offer này");
        }

        Department department = departmentRepository.findById(request.getDepartmentId())
            .orElseThrow(() -> new ResourceNotFoundException("Department", "id", request.getDepartmentId()));

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

        return mapToResponse(agreementRepository.save(agreement));
    }

    @Override
    @Transactional
    public LearningAgreementResponse signAgreement(UUID id, String signerRole, Map<String, Object> signatureData) {
        LearningAgreement agreement = agreementRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("LearningAgreement", "id", id));

        switch (signerRole.toUpperCase()) {
            case "STUDENT" -> agreement.setStudentSignature(signatureData);
            case "COMPANY_REP", "COMPANY" -> agreement.setCompanySignature(signatureData);
            case "FACULTY", "FACULTY_ADMIN" -> agreement.setFacultySignature(signatureData);
            default -> throw new BadRequestException("Vai trò ký không hợp lệ: " + signerRole);
        }

        // Nếu cả 3 bên đã ký, chuyển trạng thái sang APPROVED
        if (agreement.getStudentSignature() != null && agreement.getCompanySignature() != null && agreement.getFacultySignature() != null) {
            agreement.setStatus(AgreementStatus.APPROVED);
        } else {
            agreement.setStatus(AgreementStatus.PENDING_SIGNATURES);
        }

        return mapToResponse(agreementRepository.save(agreement));
    }

    @Override
    @Transactional
    public LearningAgreementResponse reviewAgreementByFaculty(UUID id, AgreementStatus status) {
        LearningAgreement agreement = agreementRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("LearningAgreement", "id", id));

        agreement.setStatus(status);
        return mapToResponse(agreementRepository.save(agreement));
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
