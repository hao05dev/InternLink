package com.internlink.core.repository;

import com.internlink.core.entity.Job;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface JobRepository extends JpaRepository<Job, Long> {

    List<Job> findByCompanyId(Long companyId);

    List<Job> findByStatus(String status);

    // Lấy danh sách tin đã được duyệt (APPROVED) có phân trang
    Page<Job> findByStatus(String status, Pageable pageable);

    // Tìm kiếm tin tuyển dụng đã duyệt theo từ khóa và chuyên ngành
    @Query("SELECT j FROM Job j WHERE j.status = 'APPROVED' " +
            "AND (:keyword IS NULL OR LOWER(j.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(j.description) LIKE LOWER(CONCAT('%', :keyword, '%'))) "
            +
            "AND (:targetMajor IS NULL OR j.targetMajor = :targetMajor)")
    Page<Job> searchApprovedJobs(@Param("keyword") String keyword, @Param("targetMajor") String targetMajor,
            Pageable pageable);
}