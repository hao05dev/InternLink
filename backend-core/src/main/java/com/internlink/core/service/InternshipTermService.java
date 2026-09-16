package com.internlink.core.service;

import com.internlink.core.dto.term.*;
import com.internlink.core.entity.*;
import com.internlink.core.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class InternshipTermService {

    private final InternshipTermRepository termRepository;
    private final TermStudentRegistrationRepository registrationRepository;
    private final SupervisorAssignmentRepository assignmentRepository;
    private final AssignmentHistoryRepository historyRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final UserRepository userRepository;

    // 1. Quản lý Kỳ thực tập
    public List<InternshipTerm> getAllTerms() {
        return termRepository.findAllByOrderByCreatedAtDesc();
    }

    public InternshipTerm getTermById(Long id) {
        return termRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy kỳ thực tập với ID: " + id));
    }

    @Transactional
    public InternshipTerm createTerm(InternshipTermRequest request) {
        InternshipTerm term = InternshipTerm.builder()
                .name(request.getName())
                .academicYear(request.getAcademicYear())
                .semester(request.getSemester())
                .departmentId(request.getDepartmentId())
                .registrationStartDate(request.getRegistrationStartDate())
                .registrationDeadline(request.getRegistrationDeadline())
                .internshipStartDate(request.getInternshipStartDate())
                .internshipEndDate(request.getInternshipEndDate())
                .maxCredits(request.getMaxCredits())
                .status(request.getStatus() != null ? request.getStatus() : "OPEN")
                .build();

        return termRepository.save(term);
    }

    // 2. Đăng ký / Import sinh viên vào kỳ thực tập
    @Transactional
    public TermStudentRegistration registerStudentToTerm(Long termId, Long studentProfileId, String courseClassCode) {
        if (!termRepository.existsById(termId)) {
            throw new IllegalArgumentException("Kỳ thực tập không tồn tại.");
        }
        if (!studentProfileRepository.existsById(studentProfileId)) {
            throw new IllegalArgumentException("Hồ sơ sinh viên không tồn tại.");
        }

        TermStudentRegistration registration = registrationRepository
                .findByInternshipTermIdAndStudentProfileId(termId, studentProfileId)
                .orElse(TermStudentRegistration.builder()
                        .internshipTermId(termId)
                        .studentProfileId(studentProfileId)
                        .build());

        registration.setCourseClassCode(courseClassCode);
        registration.setIsEligible(true);

        return registrationRepository.save(registration);
    }

    public List<TermStudentRegistration> getStudentsInTerm(Long termId) {
        return registrationRepository.findByInternshipTermId(termId);
    }

    // 3. Phân công Giảng viên hướng dẫn (GVHD)
    @Transactional
    public SupervisorAssignmentResponse assignSupervisor(SupervisorAssignmentRequest request, Long assignedByUserId) {
        if (!termRepository.existsById(request.getInternshipTermId())) {
            throw new IllegalArgumentException("Kỳ thực tập không tồn tại.");
        }
        StudentProfile profile = studentProfileRepository.findById(request.getStudentProfileId())
                .orElseThrow(() -> new IllegalArgumentException("Hồ sơ sinh viên không tồn tại."));

        User lecturer = userRepository.findById(request.getLecturerUserId())
                .orElseThrow(() -> new IllegalArgumentException("Giảng viên không tồn tại."));

        if (lecturer.getRole() != Role.LECTURER && lecturer.getRole() != Role.FACULTY_ADMIN) {
            throw new IllegalArgumentException("Người được phân công phải có vai trò Giảng viên hoặc Quản lý Khoa.");
        }

        SupervisorAssignment assignment = assignmentRepository
                .findByInternshipTermIdAndStudentProfileId(request.getInternshipTermId(), request.getStudentProfileId())
                .orElse(SupervisorAssignment.builder()
                        .internshipTermId(request.getInternshipTermId())
                        .studentProfileId(request.getStudentProfileId())
                        .build());

        assignment.setLecturerUserId(request.getLecturerUserId());
        assignment.setAssignedByUserId(assignedByUserId);
        assignment.setStatus("ACTIVE");

        SupervisorAssignment saved = assignmentRepository.save(assignment);
        InternshipTerm term = termRepository.findById(saved.getInternshipTermId()).orElse(null);
        User studentUser = userRepository.findById(profile.getUserId()).orElse(null);

        return SupervisorAssignmentResponse.builder()
                .id(saved.getId())
                .internshipTermId(saved.getInternshipTermId())
                .termName(term != null ? term.getName() : "N/A")
                .studentProfileId(profile.getId())
                .studentCode(profile.getStudentCode())
                .studentName(studentUser != null ? studentUser.getFullName() : "N/A")
                .lecturerUserId(lecturer.getId())
                .lecturerName(lecturer.getFullName())
                .assignedDate(saved.getAssignedDate())
                .status(saved.getStatus())
                .build();
    }

    // 4. Điều chuyển GVHD và lưu vết lịch sử
    @Transactional
    public SupervisorAssignmentResponse reassignSupervisor(Long assignmentId, ReassignSupervisorRequest request,
            Long changedByUserId) {
        SupervisorAssignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy phân công với ID: " + assignmentId));

        Long previousLecturerId = assignment.getLecturerUserId();
        User newLecturer = userRepository.findById(request.getNewLecturerUserId())
                .orElseThrow(() -> new IllegalArgumentException("Giảng viên mới không tồn tại."));

        // Lưu vết lịch sử
        AssignmentHistory history = AssignmentHistory.builder()
                .assignmentId(assignment.getId())
                .previousLecturerId(previousLecturerId)
                .newLecturerId(newLecturer.getId())
                .changedByUserId(changedByUserId)
                .reason(request.getReason())
                .build();
        historyRepository.save(history);

        // Cập nhật phân công mới
        assignment.setLecturerUserId(newLecturer.getId());
        SupervisorAssignment updated = assignmentRepository.save(assignment);

        StudentProfile profile = studentProfileRepository.findById(updated.getStudentProfileId()).orElse(null);
        User studentUser = profile != null ? userRepository.findById(profile.getUserId()).orElse(null) : null;
        InternshipTerm term = termRepository.findById(updated.getInternshipTermId()).orElse(null);

        log.info("Reassigned supervisor for Assignment ID: {} from {} to {}",
                assignmentId, previousLecturerId, newLecturer.getId());

        return SupervisorAssignmentResponse.builder()
                .id(updated.getId())
                .internshipTermId(updated.getInternshipTermId())
                .termName(term != null ? term.getName() : "N/A")
                .studentProfileId(updated.getStudentProfileId())
                .studentCode(profile != null ? profile.getStudentCode() : "N/A")
                .studentName(studentUser != null ? studentUser.getFullName() : "N/A")
                .lecturerUserId(newLecturer.getId())
                .lecturerName(newLecturer.getFullName())
                .assignedDate(updated.getAssignedDate())
                .status(updated.getStatus())
                .build();
    }

    public List<SupervisorAssignmentResponse> getAssignmentsByTerm(Long termId) {
        List<SupervisorAssignment> assignments = assignmentRepository.findByInternshipTermId(termId);
        if (assignments.isEmpty())
            return List.of();

        InternshipTerm term = termRepository.findById(termId).orElse(null);
        String termName = term != null ? term.getName() : "N/A";

        List<StudentProfile> profiles = studentProfileRepository.findAllById(
                assignments.stream().map(SupervisorAssignment::getStudentProfileId).collect(Collectors.toSet()));
        Map<Long, StudentProfile> profileMap = profiles.stream()
                .collect(Collectors.toMap(StudentProfile::getId, p -> p));

        List<User> users = userRepository.findAll();
        Map<Long, String> userNameMap = users.stream()
                .collect(Collectors.toMap(User::getId, User::getFullName, (a, b) -> a));

        return assignments.stream().map(a -> {
            StudentProfile prof = profileMap.get(a.getStudentProfileId());
            String studentName = prof != null ? userNameMap.getOrDefault(prof.getUserId(), "N/A") : "N/A";
            String studentCode = prof != null ? prof.getStudentCode() : "N/A";

            return SupervisorAssignmentResponse.builder()
                    .id(a.getId())
                    .internshipTermId(a.getInternshipTermId())
                    .termName(termName)
                    .studentProfileId(a.getStudentProfileId())
                    .studentCode(studentCode)
                    .studentName(studentName)
                    .lecturerUserId(a.getLecturerUserId())
                    .lecturerName(userNameMap.getOrDefault(a.getLecturerUserId(), "N/A"))
                    .assignedDate(a.getAssignedDate())
                    .status(a.getStatus())
                    .build();
        }).toList();
    }

    public List<AssignmentHistory> getAssignmentHistories(Long assignmentId) {
        return historyRepository.findByAssignmentIdOrderByChangedAtDesc(assignmentId);
    }
}