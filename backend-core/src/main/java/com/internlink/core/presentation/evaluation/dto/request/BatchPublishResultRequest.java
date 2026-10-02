package com.internlink.core.presentation.evaluation.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BatchPublishResultRequest {
    /**
     * Danh sách ID các placement cần công bố kết quả.
     * Nếu null hoặc rỗng, hệ thống sẽ công bố tất cả các placement đã tổng hợp điểm (finalized) trong kỳ.
     */
    private List<UUID> placementIds;
}
