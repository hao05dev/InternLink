package com.internlink.core.repository;

import com.internlink.core.entity.StudentSkill;
import com.internlink.core.entity.StudentSkillId;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface StudentSkillRepository extends JpaRepository<StudentSkill, StudentSkillId> {

    List<StudentSkill> findByIdStudentProfileId(Long studentProfileId);

    void deleteByIdStudentProfileId(Long studentProfileId);
}