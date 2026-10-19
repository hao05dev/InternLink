package com.internlink.core.presentation.evaluation.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BatchFinalizeResponse {
    private int finalizedCount;
    private int skippedCount;
    private List<String> messages;
}
