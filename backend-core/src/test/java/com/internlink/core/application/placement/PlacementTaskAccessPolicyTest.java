package com.internlink.core.application.placement;

import com.internlink.core.domain.auth.User;
import com.internlink.core.domain.placement.InternshipPlacement;
import com.internlink.core.domain.placement.PlacementTask;
import com.internlink.core.shared.enums.UserRole;
import com.internlink.core.shared.exception.ForbiddenException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

class PlacementTaskAccessPolicyTest {

    private User student;
    private User otherStudent;
    private User mentor;
    private User otherMentor;
    private User admin;
    private InternshipPlacement placement;
    private PlacementTask task;

    @BeforeEach
    void setUp() {
        student = User.builder().role(UserRole.STUDENT).build();
        student.setId(UUID.randomUUID());
        otherStudent = User.builder().role(UserRole.STUDENT).build();
        otherStudent.setId(UUID.randomUUID());
        mentor = User.builder().role(UserRole.COMPANY_MENTOR).build();
        mentor.setId(UUID.randomUUID());
        otherMentor = User.builder().role(UserRole.COMPANY_MENTOR).build();
        otherMentor.setId(UUID.randomUUID());
        admin = User.builder().role(UserRole.ADMIN).build();
        admin.setId(UUID.randomUUID());

        placement = InternshipPlacement.builder()
                .student(student)
                .mentor(mentor)
                .build();
        placement.setId(UUID.randomUUID());

        task = PlacementTask.builder()
                .placement(placement)
                .assignedByMentor(mentor)
                .build();
        task.setId(UUID.randomUUID());
    }

    @Test
    void testCanView() {
        assertTrue(PlacementTaskAccessPolicy.canView(student, placement));
        assertTrue(PlacementTaskAccessPolicy.canView(mentor, placement));
        assertTrue(PlacementTaskAccessPolicy.canView(admin, placement));
        assertFalse(PlacementTaskAccessPolicy.canView(otherStudent, placement));
        assertFalse(PlacementTaskAccessPolicy.canView(otherMentor, placement));
        assertFalse(PlacementTaskAccessPolicy.canView(null, placement));
    }

    @Test
    void testRequireCanViewThrowsForbidden() {
        assertDoesNotThrow(() -> PlacementTaskAccessPolicy.requireCanView(student, placement));
        assertThrows(ForbiddenException.class, () -> PlacementTaskAccessPolicy.requireCanView(otherStudent, placement));
    }

    @Test
    void testCanCreate() {
        assertTrue(PlacementTaskAccessPolicy.canCreate(mentor, placement));
        assertTrue(PlacementTaskAccessPolicy.canCreate(admin, placement));
        assertFalse(PlacementTaskAccessPolicy.canCreate(otherMentor, placement));
        assertFalse(PlacementTaskAccessPolicy.canCreate(student, placement));
    }

    @Test
    void testCanSubmit() {
        assertTrue(PlacementTaskAccessPolicy.canSubmit(student, task));
        assertFalse(PlacementTaskAccessPolicy.canSubmit(otherStudent, task));
        assertFalse(PlacementTaskAccessPolicy.canSubmit(mentor, task));
    }

    @Test
    void testCanReview() {
        assertTrue(PlacementTaskAccessPolicy.canReview(mentor, task));
        assertTrue(PlacementTaskAccessPolicy.canReview(admin, task));
        assertFalse(PlacementTaskAccessPolicy.canReview(otherMentor, task));
        assertFalse(PlacementTaskAccessPolicy.canReview(student, task));
    }
}
