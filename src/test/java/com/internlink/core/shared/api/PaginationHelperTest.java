package com.internlink.core.shared.api;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class PaginationHelperTest {

    private final PaginatedResponseMapper mapper = new PaginatedResponseMapper();

    @Test
    @DisplayName("PageParam should clamp size and provide sort order when requested")
    void pageParam_defaultsAndClamping() {
        PageParam defaultParam = new PageParam();
        Pageable defaultPageable = defaultParam.toPageable();

        assertThat(defaultPageable.getPageNumber()).isZero();
        assertThat(defaultPageable.getPageSize()).isEqualTo(15);
        assertThat(defaultPageable.getSort().isUnsorted()).isTrue();

        PageParam clampedParam = new PageParam();
        clampedParam.setPage(-5);
        clampedParam.setSize(500);
        clampedParam.setSortBy("title");
        clampedParam.setDirection("ASC");

        Pageable clampedPageable = clampedParam.toPageable();
        assertThat(clampedPageable.getPageNumber()).isZero();
        assertThat(clampedPageable.getPageSize()).isEqualTo(100);
        assertThat(clampedPageable.getSort().getOrderFor("title")).isNotNull();
        assertThat(clampedPageable.getSort().getOrderFor("title").getDirection()).isEqualTo(Sort.Direction.ASC);
    }

    @Test
    @DisplayName("PaginatedResponseMapper should accurately map Page content and metadata")
    void paginatedResponseMapper_mapping() {
        Pageable pageable = new PageParam().toPageable();
        List<String> rawItems = List.of("apple", "banana", "cherry");
        Page<String> springPage = new PageImpl<>(rawItems, pageable, 45);

        PageResponse<String> response = mapper.toPageResponse(springPage, String::toUpperCase);

        assertThat(response.getContent()).containsExactly("APPLE", "BANANA", "CHERRY");
        assertThat(response.getPage()).isZero();
        assertThat(response.getSize()).isEqualTo(15);
        assertThat(response.getTotalElements()).isEqualTo(45);
        assertThat(response.getTotalPages()).isEqualTo(3);
        assertThat(response.isLast()).isFalse();
    }
}
