package com.internlink.core.dto.term;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SupervisorAssignmentRequest {

    @NotNull(message = "ID kỳ thực tập không được để trống")
    private Long internshipTermId;

    @NotNull(message = "ID hồ sơ sinh viên không được để trống")
    private Long studentProfileId;

    @NotNull(message = "User ID của Giảng viên hướng dẫn không được để trống")
    private Long lecturerUserId;
}