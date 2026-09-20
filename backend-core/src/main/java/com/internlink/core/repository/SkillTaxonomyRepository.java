package com.internlink.core.repository;

import com.internlink.core.common.enums.SkillCategory;
import com.internlink.core.entity.SkillTaxonomy;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SkillTaxonomyRepository extends JpaRepository<SkillTaxonomy, String> {
    Optional<SkillTaxonomy> findBySkillName(String skillName);
    List<SkillTaxonomy> findByCategory(SkillCategory category);
    List<SkillTaxonomy> findByIsActiveTrue();
}
