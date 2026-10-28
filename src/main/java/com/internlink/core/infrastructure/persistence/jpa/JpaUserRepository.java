package com.internlink.core.infrastructure.persistence.jpa;

import com.internlink.core.shared.enums.UserRole;
import com.internlink.core.domain.auth.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;



@Repository
public interface JpaUserRepository extends JpaRepository<User, UUID> {
    @org.springframework.data.jpa.repository.Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
    @org.springframework.data.jpa.repository.Query("select u from User u where u.email = :email")
    Optional<User> findByEmailForUpdate(@org.springframework.data.repository.query.Param("email") String email);

    Optional<User> findByEmail(String email);
    @org.springframework.data.jpa.repository.Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
    @org.springframework.data.jpa.repository.Query("select u from User u where u.id = :id")
    Optional<User> findByIdForUpdate(@org.springframework.data.repository.query.Param("id") UUID id);
    Optional<User> findByGoogleSubject(String googleSubject);
    List<User> findByRole(UserRole role);
    List<User> findByDepartmentIdAndRole(UUID departmentId, UserRole role);
    List<User> findByCompanyIdAndRole(UUID companyId, UserRole role);
    boolean existsByEmail(String email);
}
