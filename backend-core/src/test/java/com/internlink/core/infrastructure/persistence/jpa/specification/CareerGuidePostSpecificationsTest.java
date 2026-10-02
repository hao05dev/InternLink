package com.internlink.core.infrastructure.persistence.jpa.specification;

import com.internlink.core.domain.system.CareerGuidePost;
import com.internlink.core.shared.enums.PostCategory;
import jakarta.persistence.criteria.*;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.jpa.domain.Specification;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CareerGuidePostSpecificationsTest {

    @Mock
    private Root<CareerGuidePost> root;

    @Mock
    private CriteriaQuery<?> query;

    @Mock
    private CriteriaBuilder cb;

    @Mock
    private Path<Object> categoryPath;

    @Mock
    private Path<Object> statusPath;

    @Mock
    private Path<String> titlePath;

    @Mock
    private Path<String> summaryPath;

    @Mock
    private Predicate predicate;

    @Mock
    private Expression<String> lowerExpr;

    @Test
    @DisplayName("withFilters - all parameters null returns conjunction")
    void withFilters_allNull_returnsConjunction() {
        when(cb.conjunction()).thenReturn(predicate);

        Specification<CareerGuidePost> spec = CareerGuidePostSpecifications.withFilters(null, null, null);
        Predicate result = spec.toPredicate(root, query, cb);

        assertThat(result).isEqualTo(predicate);
        verify(cb).conjunction();
    }

    @Test
    @DisplayName("withFilters - category and status provided adds equality predicates")
    void withFilters_categoryAndStatus_addsPredicates() {
        when(root.get("category")).thenReturn(categoryPath);
        when(root.get("status")).thenReturn(statusPath);
        when(cb.equal(categoryPath, PostCategory.JOB_FAIR)).thenReturn(predicate);
        when(cb.equal(statusPath, "PUBLISHED")).thenReturn(predicate);
        when(cb.and(any(Predicate[].class))).thenReturn(predicate);

        Specification<CareerGuidePost> spec = CareerGuidePostSpecifications.withFilters(
            PostCategory.JOB_FAIR, "PUBLISHED", null
        );
        Predicate result = spec.toPredicate(root, query, cb);

        assertThat(result).isEqualTo(predicate);
        verify(cb).equal(categoryPath, PostCategory.JOB_FAIR);
        verify(cb).equal(statusPath, "PUBLISHED");
    }

    @Test
    @DisplayName("withFilters - search keyword provided adds title/summary like predicates")
    void withFilters_searchKeyword_addsLikePredicates() {
        when(root.<String>get("title")).thenReturn(titlePath);
        when(root.<String>get("summary")).thenReturn(summaryPath);
        when(cb.lower(titlePath)).thenReturn(lowerExpr);
        when(cb.lower(summaryPath)).thenReturn(lowerExpr);
        when(cb.like(eq(lowerExpr), eq("%fpt%"))).thenReturn(predicate);
        when(cb.or(any(), any())).thenReturn(predicate);
        when(cb.and(any(Predicate[].class))).thenReturn(predicate);

        Specification<CareerGuidePost> spec = CareerGuidePostSpecifications.withFilters(null, null, "  fpt  ");
        Predicate result = spec.toPredicate(root, query, cb);

        assertThat(result).isEqualTo(predicate);
        verify(cb, times(2)).like(eq(lowerExpr), eq("%fpt%"));
    }
}
