package com.internlink.core.presentation.organization.dto.request;

import com.internlink.core.shared.enums.EligibilityStatus;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.UUID;



@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentRosterImportItem {

    @NotNull(message = "Ngành học không được để trống")
    private UUID programId;

    @NotBlank(message = "Mã số sinh viên không được để trống")
    private String studentCode;

    @NotBlank(message = "Email CTU không được để trống")
    @Email(message = "Email không đúng định dạng")
    private String officialEmail;

    @NotBlank(message = "Họ và tên không được để trống")
    private String fullName;

    @NotBlank(message = "Khóa học không được để trống")
    private String academicYear;

    @NotBlank(message = "Mã học phần thực tập không được để trống")
    private String internshipCourseCode;

    @Builder.Default
    private EligibilityStatus eligibilityStatus = EligibilityStatus.ELIGIBLE;

    private String eligibilityNote;
}
