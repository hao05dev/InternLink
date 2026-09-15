package com.internlink.core.repository;

import com.internlink.core.entity.CurriculumVitae;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CurriculumVitaeRepository extends JpaRepository<CurriculumVitae, Long> {

    List<CurriculumVitae> findByStudentProfileId(Long studentProfileId);

    Optional<CurriculumVitae> findByStudentProfileIdAndIsDefaultTrue(Long studentProfileId);
}