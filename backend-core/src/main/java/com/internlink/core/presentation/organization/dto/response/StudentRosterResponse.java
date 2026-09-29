package com.internlink.core.presentation.organization.dto.response;

import com.internlink.core.shared.enums.EligibilityStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.OffsetDateTime;
import java.util.UUID;



@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentRosterResponse {

    private UUID id;
    private UUID termId;
    private String termName;
    private UUID programId;
    private String programName;
    private String studentCode;
    private String officialEmail;
    private String fullName;
    private String academicYear;
    private String classCode;
    private String internshipCourseCode;
    private EligibilityStatus eligibilityStatus;
    private String eligibilityNote;
    private UUID claimedUserId;
    private OffsetDateTime claimedAt;
    private OffsetDateTime createdAt;
    private String defaultPassword; // Only returned when newly provisioned
}
