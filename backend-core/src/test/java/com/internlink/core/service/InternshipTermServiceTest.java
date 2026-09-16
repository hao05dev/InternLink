package com.internlink.core.service;

import com.internlink.core.dto.term.InternshipTermRequest;
import com.internlink.core.dto.term.ReassignSupervisorRequest;
import com.internlink.core.dto.term.SupervisorAssignmentRequest;
import com.internlink.core.dto.term.SupervisorAssignmentResponse;
import com.internlink.core.entity.*;
import com.internlink.core.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class InternshipTermServiceTest {

    @Mock
    private InternshipTermRepository termRepository;
    @Mock
    private TermStudentRegistrationRepository registrationRepository;
    @Mock
    private SupervisorAssignmentRepository assignmentRepository;
    @Mock
    private AssignmentHistoryRepository historyRepository;
    @Mock
    private StudentProfileRepository studentProfileRepository;
    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private InternshipTermService termService;

    private InternshipTerm sampleTerm;
    private StudentProfile sampleProfile;
    private User sampleLecturer;

    @BeforeEach
    void setUp() {
        sampleTerm = InternshipTerm.builder()
                .id(1L)
                .name("Học kỳ 1 - 2026-2027")
                .academicYear("2026-2027")
                .semester(1)
                .registrationStartDate(LocalDate.of(2026, 8, 1))
                .registrationDeadline(LocalDate.of(2026, 9, 15))
                .internshipStartDate(LocalDate.of(2026, 9, 20))
                .internshipEndDate(LocalDate.of(2027, 1, 15))
                .status("OPEN")
                .build();

        sampleProfile = StudentProfile.builder()
                .id(10L)
                .userId(100L)
                .studentCode("21110001")
                .build();

        sampleLecturer = User.builder()
                .id(20L)
                .fullName("TS. Nguyen Van An")
                .role(Role.LECTURER)
                .build();
    }

    @Test
    @DisplayName("Tạo kỳ thực tập mới thành công")
    void createTerm_Success() {
        InternshipTermRequest req = InternshipTermRequest.builder()
                .name("Học kỳ 1 - 2026-2027")
                .academicYear("2026-2027")
                .semester(1)
                .registrationStartDate(LocalDate.of(2026, 8, 1))
                .registrationDeadline(LocalDate.of(2026, 9, 15))
                .internshipStartDate(LocalDate.of(2026, 9, 20))
                .internshipEndDate(LocalDate.of(2027, 1, 15))
                .build();

        when(termRepository.save(any(InternshipTerm.class))).thenReturn(sampleTerm);

        InternshipTerm created = termService.createTerm(req);

        assertNotNull(created.getId());
        assertEquals("Học kỳ 1 - 2026-2027", created.getName());
    }

    @Test
    @DisplayName("Phân công Giảng viên hướng dẫn thành công")
    void assignSupervisor_Success() {
        SupervisorAssignmentRequest req = SupervisorAssignmentRequest.builder()
                .internshipTermId(1L)
                .studentProfileId(10L)
                .lecturerUserId(20L)
                .build();

        when(termRepository.existsById(1L)).thenReturn(true);
        when(studentProfileRepository.findById(10L)).thenReturn(Optional.of(sampleProfile));
        when(userRepository.findById(20L)).thenReturn(Optional.of(sampleLecturer));
        when(assignmentRepository.findByInternshipTermIdAndStudentProfileId(1L, 10L)).thenReturn(Optional.empty());
        when(assignmentRepository.save(any(SupervisorAssignment.class))).thenAnswer(i -> {
            SupervisorAssignment sa = i.getArgument(0);
            sa.setId(1L);
            return sa;
        });
        when(termRepository.findById(1L)).thenReturn(Optional.of(sampleTerm));

        SupervisorAssignmentResponse res = termService.assignSupervisor(req, 2L);

        assertNotNull(res);
        assertEquals(20L, res.getLecturerUserId());
        assertEquals("TS. Nguyen Van An", res.getLecturerName());
        assertEquals("21110001", res.getStudentCode());
    }

    @Test
    @DisplayName("Điều chuyển GVHD và lưu vết lịch sử thành công")
    void reassignSupervisor_Success() {
        SupervisorAssignment currentAssignment = SupervisorAssignment.builder()
                .id(1L)
                .internshipTermId(1L)
                .studentProfileId(10L)
                .lecturerUserId(20L)
                .status("ACTIVE")
                .build();

        User newLecturer = User.builder()
                .id(30L)
                .fullName("TS. Tran Thi B")
                .role(Role.LECTURER)
                .build();

        ReassignSupervisorRequest req = ReassignSupervisorRequest.builder()
                .newLecturerUserId(30L)
                .reason("Giảng viên cũ đi công tác")
                .build();

        when(assignmentRepository.findById(1L)).thenReturn(Optional.of(currentAssignment));
        when(userRepository.findById(30L)).thenReturn(Optional.of(newLecturer));
        when(assignmentRepository.save(any(SupervisorAssignment.class))).thenAnswer(i -> i.getArgument(0));

        SupervisorAssignmentResponse res = termService.reassignSupervisor(1L, req, 2L);

        assertEquals(30L, res.getLecturerUserId());
        assertEquals("TS. Tran Thi B", res.getLecturerName());
        verify(historyRepository, times(1)).save(any(AssignmentHistory.class));
    }
}