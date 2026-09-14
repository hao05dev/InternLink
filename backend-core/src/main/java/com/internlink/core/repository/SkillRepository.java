package com.internlink.core.repository;

import com.internlink.core.entity.Skill;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SkillRepository extends JpaRepository<Skill, String> {
    List<Skill> findByCategory(String category);
    Optional<Skill> findByName(String name);
}
