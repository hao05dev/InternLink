package com.internlink.core.infrastructure.persistence.jpa;

import com.internlink.core.shared.enums.SkillCategory;
import com.internlink.core.domain.ai_matching.SkillTaxonomy;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;



@Repository
public interface JpaSkillTaxonomyRepository extends JpaRepository<SkillTaxonomy, String> {
    Optional<SkillTaxonomy> findBySkillName(String skillName);
    List<SkillTaxonomy> findByCategory(SkillCategory category);
    List<SkillTaxonomy> findByIsActiveTrue();
}
