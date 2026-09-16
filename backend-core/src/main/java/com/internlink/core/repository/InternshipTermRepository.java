package com.internlink.core.repository;

import com.internlink.core.entity.InternshipTerm;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InternshipTermRepository extends JpaRepository<InternshipTerm, Long> {

    List<InternshipTerm> findByStatusOrderByCreatedAtDesc(String status);

    List<InternshipTerm> findAllByOrderByCreatedAtDesc();

    Optional<InternshipTerm> findFirstByStatusOrderByCreatedAtDesc(String status);
}