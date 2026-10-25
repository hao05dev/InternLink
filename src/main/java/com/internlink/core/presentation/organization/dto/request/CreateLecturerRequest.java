package com.internlink.core.presentation.organization.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateLecturerRequest {
    private String staffCode;

    @NotBlank(message = "Họ và tên giảng viên không được để trống")
    @Size(max = 150)
    private String fullName;

    @NotBlank(message = "Email không được để trống")
    @Email(message = "Email không đúng định dạng")
    @Size(max = 150)
    private String email;

    @Size(max = 20)
    private String phoneNumber;

    private String title;

    private Integer maxStudents;
}
