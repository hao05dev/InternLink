package com.internlink.core.application.ai_matching.impl;

import com.internlink.core.application.ai_matching.AiMatchingService;
import com.internlink.core.domain.ai_matching.StudentSkill;
import com.internlink.core.domain.ai_matching.StudentSkillId;
import com.internlink.core.domain.auth.User;
import com.internlink.core.infrastructure.persistence.jpa.*;
import com.internlink.core.presentation.ai_matching.dto.response.AiMatchScoreResponse;
import com.internlink.core.presentation.ai_matching.dto.response.SkillTaxonomyResponse;
import com.internlink.core.presentation.ai_matching.dto.response.StudentSkillResponse;
import com.internlink.core.shared.enums.UserRole;
import com.internlink.core.shared.exception.ForbiddenException;
import com.internlink.core.shared.exception.ResourceNotFoundException;
import com.internlink.core.shared.security.ResourceAuthorization;
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
public class AiMatchingServiceImpl implements AiMatchingService {

    private final JpaSkillTaxonomyRepository taxonomyRepository;
    private final JpaStudentSkillRepository studentSkillRepository;
    private final JpaUserRepository userRepository;
    private final JpaJobApplicationRepository applicationRepository;
    private final JpaInternshipPlacementRepository placementRepository;
    private final JpaStudentProfileRepository studentProfileRepository;
    private final SecurityGuard securityGuard;

    private final AiMatchingMapper mapper;
    private final AiCvProcessingHandler cvProcessingHandler;
    private final AiMatchScoringHandler matchScoringHandler;

    @Override
    @Transactional(readOnly = true)
    public List<SkillTaxonomyResponse> getAllTaxonomySkills() {
        return taxonomyRepository.findAll().stream()
            .map(mapper::toTaxonomyResponse)
            .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<StudentSkillResponse> getSkillsByStudent(UUID studentId) {
        UUID actorId = securityGuard.currentUser().getId();
        User actor = userRepository.findById(actorId)
            .orElseThrow(() -> new ResourceNotFoundException("User", "id", actorId));
        boolean isSelf = actorId.equals(studentId);
        boolean facultyAccess = actor.getRole() == UserRole.FACULTY_ADMIN
            && studentProfileRepository.findByUserId(studentId)
                .map(profile -> ResourceAuthorization.managesDepartment(
                    actor, profile.getProgram().getDepartment().getId())).orElse(false);
        boolean lecturerAccess = actor.getRole() == UserRole.LECTURER
            && placementRepository.findByStudentId(studentId).stream()
                .anyMatch(placement -> actorId.equals(placement.getLecturer().getId()));
        boolean companyAccess = actor.getRole() == UserRole.COMPANY_REP
            && applicationRepository.findByStudentId(studentId).stream()
                .anyMatch(app -> ResourceAuthorization.representsCompany(
                    actor, app.getJob().getCompany().getId()));
        ResourceAuthorization.require(isSelf || ResourceAuthorization.isAdmin(actor)
            || facultyAccess || lecturerAccess || companyAccess);
        return studentSkillRepository.findByIdStudentId(studentId).stream()
            .filter(skill -> isSelf || Boolean.TRUE.equals(skill.getIsConfirmed()))
            .map(mapper::toStudentSkillResponse)
            .toList();
    }

    @Override
    @Transactional
    public List<StudentSkillResponse> syncCvSkills(UUID studentId, UUID documentId, String cvText) {
        if (!studentId.equals(securityGuard.currentUser().getId())) {
            throw new ForbiddenException("Chỉ sinh viên sở hữu CV mới được đồng bộ kỹ năng");
        }
        return cvProcessingHandler.processCvSkills(studentId, documentId, cvText, Map.of()).skills();
    }

    @Override
    @Transactional
    public UUID reprocessFailedCvRun(UUID runId, String cvText) {
        return cvProcessingHandler.reprocessFailedCvRun(runId, cvText);
    }

    @Override
    @Transactional
    public StudentSkillResponse confirmStudentSkill(UUID studentId, String skillId, Boolean confirmed) {
        UUID currentUserId = securityGuard.currentUser().getId();
        securityGuard.requireSelf(currentUserId, studentId, "StudentSkill");

        StudentSkillId id = new StudentSkillId(studentId, skillId);
        StudentSkill skill = studentSkillRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("StudentSkill", "id", skillId));

        skill.setIsConfirmed(confirmed);
        return mapper.toStudentSkillResponse(studentSkillRepository.save(skill));
    }

    @Override
    @Transactional(readOnly = true)
    public AiMatchScoreResponse calculateMatchScoreForJob(UUID studentId, UUID jobId) {
        return matchScoringHandler.calculateMatchScoreForJob(studentId, jobId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AiMatchScoreResponse> recommendJobsForStudent(UUID studentId, UUID termId) {
        return matchScoringHandler.recommendJobsForStudent(studentId, termId);
    }
}
