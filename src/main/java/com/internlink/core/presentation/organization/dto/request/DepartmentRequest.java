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
public class DepartmentRequest {

    @NotBlank(message = "Mã khoa không được để trống")
    @Size(max = 50, message = "Mã khoa không quá 50 ký tự")
    private String code;

    @NotBlank(message = "Tên khoa không được để trống")
    @Size(max = 200, message = "Tên khoa không quá 200 ký tự")
    private String name;

    @NotBlank(message = "Email liên hệ không được để trống")
    @Email(message = "Email không đúng định dạng")
    private String contactEmail;

    @Builder.Default
    private Boolean isActive = true;
}