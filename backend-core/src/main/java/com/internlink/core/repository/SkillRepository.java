package com.internlink.core.repository;

import com.internlink.core.entity.Skill;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface SkillRepository extends JpaRepository<Skill, String> {
    List<Skill> findByCategory(String category);
}
