package com.internlink.core.repository;

import com.internlink.core.entity.StudentSkill;
import com.internlink.core.entity.StudentSkillId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface StudentSkillRepository extends JpaRepository<StudentSkill, StudentSkillId> {
    List<StudentSkill> findByStudentId(UUID studentId);
    List<StudentSkill> findByStudentIdAndIsConfirmedTrue(UUID studentId);
}
