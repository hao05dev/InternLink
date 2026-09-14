package com.internlink.core.repository;

import com.internlink.core.entity.Skill;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface SkillRepository extends JpaRepository<Skill, String> {

    List<Skill> findByCategory(String category);

    Optional<Skill> findByNameIgnoreCase(String name);

    // Tìm kiếm kỹ năng theo từ khóa (tên hoặc từ đồng nghĩa synonyms)
    @Query("SELECT s FROM Skill s WHERE LOWER(s.name) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
            "OR LOWER(s.synonyms) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<Skill> searchSkills(@Param("keyword") String keyword);
}