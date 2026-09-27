package com.internlink.core.application.organization.impl;

import com.internlink.core.application.organization.StudentRosterService;
import com.internlink.core.domain.organization.AcademicProgram;
import com.internlink.core.domain.organization.InternshipTerm;
import com.internlink.core.domain.organization.StudentRoster;
import com.internlink.core.infrastructure.persistence.jpa.JpaAcademicProgramRepository;
import com.internlink.core.infrastructure.persistence.jpa.JpaInternshipTermRepository;
import com.internlink.core.infrastructure.persistence.jpa.JpaStudentRosterRepository;
import com.internlink.core.presentation.organization.dto.request.StudentRosterImportItem;
import com.internlink.core.presentation.organization.dto.response.StudentRosterResponse;
import com.internlink.core.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class StudentRosterServiceImpl implements StudentRosterService {

    private final JpaStudentRosterRepository rosterRepository;
    private final JpaInternshipTermRepository termRepository;
    private final JpaAcademicProgramRepository programRepository;

    @Override
    @Transactional(readOnly = true)
    public List<StudentRosterResponse> getRostersByTerm(UUID termId) {
        return rosterRepository.findByTermId(termId).stream()
            .map(this::mapToResponse)
            .toList();
    }

    @Override
    @Transactional
    public List<StudentRosterResponse> importRosterList(UUID termId, List<StudentRosterImportItem> items) {
        InternshipTerm term = termRepository.findById(termId)
            .orElseThrow(() -> new ResourceNotFoundException("InternshipTerm", "id", termId));

        List<StudentRoster> rostersToSave = new ArrayList<>();

        for (StudentRosterImportItem item : items) {
            AcademicProgram program = programRepository.findById(item.getProgramId())
                .orElseThrow(() -> new ResourceNotFoundException("AcademicProgram", "id", item.getProgramId()));

            if (!program.getDepartment().getId().equals(term.getDepartment().getId())) {
                throw new com.internlink.core.shared.exception.BadRequestException(
                    "Ngành học không thuộc khoa quản lý kỳ thực tập");
            }

            // Nếu đã tồn tại trong kỳ thì cập nhật, nếu chưa thì tạo mới
            StudentRoster roster = rosterRepository
                .findByTermIdAndStudentCode(termId, item.getStudentCode().trim().toUpperCase())
                .orElse(StudentRoster.builder()
                    .term(term)
                    .studentCode(item.getStudentCode().trim().toUpperCase())
                    .build());

            roster.setProgram(program);
            roster.setOfficialEmail(item.getOfficialEmail().trim().toLowerCase());
            roster.setFullName(item.getFullName().trim());
            roster.setAcademicYear(item.getAcademicYear().trim());
            if (item.getInternshipCourseCode() == null || item.getInternshipCourseCode().isBlank())
                throw new com.internlink.core.shared.exception.BadRequestException("Cần mã học phần thực tập theo chương trình đào tạo");
            roster.setInternshipCourseCode(item.getInternshipCourseCode().trim().toUpperCase());
            roster.setEligibilityStatus(item.getEligibilityStatus());
            roster.setEligibilityNote(item.getEligibilityNote());

            rostersToSave.add(roster);
        }

        return rosterRepository.saveAll(rostersToSave).stream()
            .map(this::mapToResponse)
            .toList();
    }

    private StudentRosterResponse mapToResponse(StudentRoster entity) {
        return StudentRosterResponse.builder()
            .id(entity.getId())
            .termId(entity.getTerm().getId())
            .termName(entity.getTerm().getTermName())
            .programId(entity.getProgram().getId())
            .programName(entity.getProgram().getName())
            .studentCode(entity.getStudentCode())
            .officialEmail(entity.getOfficialEmail())
            .fullName(entity.getFullName())
            .academicYear(entity.getAcademicYear())
            .internshipCourseCode(entity.getInternshipCourseCode())
            .eligibilityStatus(entity.getEligibilityStatus())
            .eligibilityNote(entity.getEligibilityNote())
            .claimedUserId(entity.getClaimedUser() != null ? entity.getClaimedUser().getId() : null)
            .claimedAt(entity.getClaimedAt())
            .createdAt(entity.getCreatedAt())
            .build();
    }
}
