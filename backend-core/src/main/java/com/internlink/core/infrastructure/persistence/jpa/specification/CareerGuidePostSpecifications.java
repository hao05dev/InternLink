package com.internlink.core.infrastructure.persistence.jpa.specification;

import com.internlink.core.domain.system.CareerGuidePost;
import com.internlink.core.shared.enums.PostCategory;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

/**
 * Specification builder for CareerGuidePost dynamic filtering.
 * Follows Single Responsibility Principle (SRP).
 */
public final class CareerGuidePostSpecifications {

    private CareerGuidePostSpecifications() {
        // Utility class
    }

    public static Specification<CareerGuidePost> withFilters(
        PostCategory category,
        String status,
        String search
    ) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (category != null) {
                predicates.add(cb.equal(root.get("category"), category));
            }

            if (status != null && !status.isBlank()) {
                predicates.add(cb.equal(root.get("status"), status.trim().toUpperCase(Locale.ROOT)));
            }

            if (search != null && !search.isBlank()) {
                String cleanSearch = "%" + search.trim().toLowerCase(Locale.ROOT) + "%";
                Predicate titleLike = cb.like(cb.lower(root.get("title")), cleanSearch);
                Predicate summaryLike = cb.like(cb.lower(root.get("summary")), cleanSearch);
                predicates.add(cb.or(titleLike, summaryLike));
            }

            if (predicates.isEmpty()) {
                return cb.conjunction();
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
