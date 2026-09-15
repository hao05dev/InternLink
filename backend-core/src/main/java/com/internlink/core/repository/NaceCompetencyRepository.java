package com.internlink.core.repository;

import com.internlink.core.entity.NaceCompetency;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface NaceCompetencyRepository extends JpaRepository<NaceCompetency, String> {
}
