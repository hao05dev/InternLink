package com.internlink.core.presentation.organization.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.UUID;



@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AcademicProgramRequest {

    @NotNull(message = "Khoa quản lý không được để trống")
    private UUID departmentId;

    @NotBlank(message = "Mã ngành không được để trống")
    @Size(max = 50, message = "Mã ngành không quá 50 ký tự")
    private String code;

    @NotBlank(message = "Tên ngành không được để trống")
    @Size(max = 200, message = "Tên ngành không quá 200 ký tự")
    private String name;

    @Builder.Default
    private String degreeLevel = "UNDERGRADUATE";

    @Builder.Default
    private Boolean isActive = true;
}