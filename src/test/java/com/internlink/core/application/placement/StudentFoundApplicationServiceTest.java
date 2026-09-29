package com.internlink.core.application.placement;

import com.internlink.core.application.system.NotificationService;
import com.internlink.core.domain.auth.User;
import com.internlink.core.domain.organization.*;
import com.internlink.core.domain.placement.*;
import com.internlink.core.domain.system.Document;
import com.internlink.core.infrastructure.persistence.jpa.*;
import com.internlink.core.infrastructure.security.CustomUserDetail;
import com.internlink.core.presentation.placement.dto.request.StudentFoundRequest;
import com.internlink.core.shared.enums.*;
import com.internlink.core.shared.security.SecurityGuard;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class StudentFoundApplicationServiceTest {
    @Mock JpaStudentFoundApplicationRepository applications;
    @Mock JpaInternshipPlacementRepository placements;
    @Mock JpaStudentRosterRepository rosters;
    @Mock JpaInternshipTermRepository terms;
    @Mock JpaDocumentRepository documents;
    @Mock JpaUserRepository users;
    @Mock SecurityGuard security;
    @Mock NotificationService notifications;

    @Test
    void createsPlacementWithoutOfferCompanyOrMentorAfterVerifiedAcceptance() {
        var service = new StudentFoundApplicationService(applications, placements, rosters, terms, documents, users, security, notifications);
        Department department = Department.builder().code("CICT").name("CNTT&TT").build();
        department.setId(UUID.randomUUID());
        User student = User.builder().role(UserRole.STUDENT).fullName("Sinh viên").build();
        student.setId(UUID.randomUUID());
        User admin = User.builder().role(UserRole.FACULTY_ADMIN).department(department).build();
        admin.setId(UUID.randomUUID());
        User lecturer = User.builder().role(UserRole.LECTURER).department(department).build();
        lecturer.setId(UUID.randomUUID());
        InternshipTerm term = InternshipTerm.builder().department(department).status(TermStatus.APPLICATION_OPEN)
            .startDate(LocalDate.now()).endDate(LocalDate.now().plusMonths(3)).build();
        term.setId(UUID.randomUUID());
        StudentRoster roster = StudentRoster.builder().term(term).claimedUser(student)
            .eligibilityStatus(EligibilityStatus.ELIGIBLE).internshipCourseCode("CT518E").build();
        when(terms.findById(term.getId())).thenReturn(Optional.of(term));
        when(rosters.findByTermIdAndClaimedUserId(term.getId(), student.getId())).thenReturn(Optional.of(roster));
        when(users.findById(student.getId())).thenReturn(Optional.of(student));
        when(users.findById(admin.getId())).thenReturn(Optional.of(admin));
        when(users.findById(lecturer.getId())).thenReturn(Optional.of(lecturer));
        when(applications.save(any())).thenAnswer(invocation -> {
            StudentFoundApplication value = invocation.getArgument(0);
            if (value.getId() == null) value.setId(UUID.randomUUID());
            return value;
        });
        when(placements.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

        when(security.currentUser()).thenReturn(CustomUserDetail.create(student));
        var created = service.create(new StudentFoundRequest(term.getId(), "Đơn vị X", "Cần Thơ", "Người nhận",
            "host@example.com", "Làm dự án", LocalDate.now(), LocalDate.now().plusMonths(2)));
        StudentFoundApplication application = applications.findById(created.id()).orElse(null);
        // The repository is mocked, so use the saved object for subsequent requests.
        ArgumentCaptor<StudentFoundApplication> applicationCaptor = ArgumentCaptor.forClass(StudentFoundApplication.class);
        verify(applications).save(applicationCaptor.capture());
        application = applicationCaptor.getValue();
        when(applications.findById(application.getId())).thenReturn(Optional.of(application));

        Document acceptance = Document.builder().owner(student).contextType(ContextType.SELF_FOUND)
            .contextId(application.getId()).documentType(DocumentType.ACCEPTANCE_LETTER).status("ACTIVE").build();
        acceptance.setId(UUID.randomUUID());
        when(documents.findById(acceptance.getId())).thenReturn(Optional.of(acceptance));
        service.submit(application.getId(), acceptance.getId());

        when(security.currentUser()).thenReturn(CustomUserDetail.create(admin));
        service.review(application.getId(), "APPROVED", null, lecturer.getId());
        ArgumentCaptor<InternshipPlacement> placementCaptor = ArgumentCaptor.forClass(InternshipPlacement.class);
        verify(placements).save(placementCaptor.capture());
        InternshipPlacement placement = placementCaptor.getValue();
        assertThat(placement.getSource()).isEqualTo("STUDENT_FOUND");
        assertThat(placement.getAgreement()).isNull();
        assertThat(placement.getCompany()).isNull();
        assertThat(placement.getMentor()).isNull();
        assertThat(placement.getLecturer()).isEqualTo(lecturer);
    }
}
