package com.internlink.core.infrastructure.persistence.jpa;

import com.internlink.core.domain.ai_matching.StudentSkill;
import com.internlink.core.domain.ai_matching.StudentSkillId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;



@Repository
public interface JpaStudentSkillRepository extends JpaRepository<StudentSkill, StudentSkillId> {
    List<StudentSkill> findByIdStudentId(UUID studentId);
    List<StudentSkill> findByIdStudentIdAndIsConfirmedTrue(UUID studentId);
    List<StudentSkill> findByStudent_Id(UUID studentId);
}
