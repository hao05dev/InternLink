package com.internlink.core.shared.api;

import org.springframework.data.domain.Page;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.function.Function;

/**
 * Đảm nhiệm duy nhất 1 nhiệm vụ: Chuyển đổi Spring Data Page<Entity> sang PageResponse<DTO>.
 */
@Component
public class PaginatedResponseMapper {

    /**
     * Chuyển đổi một đối tượng Spring Data Page sang PageResponse với hàm mapper tùy chỉnh.
     *
     * @param page              Trang dữ liệu Entity từ Repository
     * @param entityToDtoMapper Hàm chuyển đổi từ Entity sang DTO
     * @param <E>               Kiểu Entity
     * @param <D>               Kiểu DTO
     * @return Đối tượng PageResponse chuẩn hóa cho client
     */
    public <E, D> PageResponse<D> toPageResponse(Page<E> page, Function<E, D> entityToDtoMapper) {
        if (page == null) {
            return PageResponse.<D>builder()
                    .content(List.of())
                    .page(0)
                    .size(0)
                    .totalElements(0)
                    .totalPages(0)
                    .last(true)
                    .build();
        }

        List<D> dtos = page.getContent().stream()
                .map(entityToDtoMapper)
                .toList();

        return PageResponse.<D>builder()
                .content(dtos)
                .page(page.getNumber())
                .size(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .last(page.isLast())
                .build();
    }
}
