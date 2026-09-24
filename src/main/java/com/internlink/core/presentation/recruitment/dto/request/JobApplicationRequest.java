package com.internlink.core.presentation.recruitment.dto.request;

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
public class JobApplicationRequest {

    @NotNull(message = "Vị trí tuyển dụng không được để trống")
    private UUID jobId;

    @NotNull(message = "CV đính kèm không được để trống")
    private UUID submittedCvDocumentId;

    private String coverLetter;
}