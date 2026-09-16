package com.internlink.core.dto.term;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InternshipTermRequest {

    @NotBlank(message = "Tên kỳ thực tập không được để trống")
    private String name;

    @NotBlank(message = "Năm học không được để trống (vd: 2026-2027)")
    private String academicYear;

    @NotNull(message = "Học kỳ không được để trống (1, 2, 3)")
    private Integer semester;

    private Long departmentId;

    @NotNull(message = "Ngày bắt đầu đăng ký không được để trống")
    private LocalDate registrationStartDate;

    @NotNull(message = "Hạn chót đăng ký không được để trống")
    private LocalDate registrationDeadline;

    @NotNull(message = "Ngày bắt đầu thực tập không được để trống")
    private LocalDate internshipStartDate;

    @NotNull(message = "Ngày kết thúc thực tập không được để trống")
    private LocalDate internshipEndDate;

    @Builder.Default
    private Integer maxCredits = 10;

    @Builder.Default
    private String status = "OPEN";
}