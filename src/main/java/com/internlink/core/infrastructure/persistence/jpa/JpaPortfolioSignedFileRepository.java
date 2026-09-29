package com.internlink.core.infrastructure.persistence.jpa;
import com.internlink.core.domain.placement.PortfolioSignedFile;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;
public interface JpaPortfolioSignedFileRepository extends JpaRepository<PortfolioSignedFile,UUID> {
    List<PortfolioSignedFile> findByFormIdOrderByCreatedAtDesc(UUID formId);
}
