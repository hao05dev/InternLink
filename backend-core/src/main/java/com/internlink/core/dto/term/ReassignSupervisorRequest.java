package com.internlink.core.dto.term;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReassignSupervisorRequest {

    @NotNull(message = "User ID của Giảng viên mới không được để trống")
    private Long newLecturerUserId;

    @NotBlank(message = "Lý do thay đổi GVHD không được để trống")
    private String reason;
}