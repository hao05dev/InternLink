package com.internlink.core.presentation.recruitment.dto.request;

import com.internlink.core.shared.enums.InterviewRoundResult;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RecordInterviewResultRequest {

    @NotNull(message = "Kết quả phỏng vấn không được để trống")
    private InterviewRoundResult result;

    @Size(max = 2000, message = "Nhận xét phỏng vấn không quá 2000 ký tự")
    private String feedback;
}
