package com.internlink.core.repository;

import com.internlink.core.common.enums.UserRole;
import com.internlink.core.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {
    Optional<User> findByEmail(String email);
    Optional<User> findByGoogleSubject(String googleSubject);
    List<User> findByRole(UserRole role);
    List<User> findByDepartmentIdAndRole(UUID departmentId, UserRole role);
    List<User> findByCompanyIdAndRole(UUID companyId, UserRole role);
    boolean existsByEmail(String email);
}
