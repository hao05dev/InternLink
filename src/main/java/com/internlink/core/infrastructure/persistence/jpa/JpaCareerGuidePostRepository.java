package com.internlink.core.infrastructure.persistence.jpa;

import com.internlink.core.domain.system.CareerGuidePost;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface JpaCareerGuidePostRepository
    extends JpaRepository<CareerGuidePost, UUID>, JpaSpecificationExecutor<CareerGuidePost> {

    Optional<CareerGuidePost> findBySlug(String slug);

    boolean existsBySlug(String slug);

    boolean existsBySlugAndIdNot(String slug, UUID id);

    @Modifying
    @Query("UPDATE CareerGuidePost p SET p.viewCount = p.viewCount + 1 WHERE p.id = :id")
    void incrementViewCount(@Param("id") UUID id);
}
