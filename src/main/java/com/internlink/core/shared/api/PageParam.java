package com.internlink.core.shared.api;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.util.StringUtils;

/**
 * Đảm nhiệm duy nhất 1 nhiệm vụ: Đóng gói và chuẩn hóa các tham số phân trang, sắp xếp từ HTTP Request.
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PageParam {

    @Builder.Default
    private int page = 0;

    @Builder.Default
    private int size = 15;

    private String sortBy;

    @Builder.Default
    private String direction = "DESC";

    /**
     * Chuyển đổi an toàn sang Spring Data Pageable với giới hạn kích thước tối đa 100 bản ghi/trang.
     */
    public Pageable toPageable() {
        int safePage = Math.max(0, page);
        int safeSize = Math.max(1, Math.min(size, 100));

        if (!StringUtils.hasText(sortBy)) {
            return PageRequest.of(safePage, safeSize);
        }

        Sort.Direction dir = "ASC".equalsIgnoreCase(direction) ? Sort.Direction.ASC : Sort.Direction.DESC;
        return PageRequest.of(safePage, safeSize, Sort.by(dir, sortBy));
    }
}
