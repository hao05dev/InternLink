package com.internlink.core.infrastructure.persistence.jpa;

import com.internlink.core.shared.enums.ContextType;
import com.internlink.core.domain.system.Document;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;



@Repository
public interface JpaDocumentRepository extends JpaRepository<Document, UUID> {
    List<Document> findByContextTypeAndContextId(ContextType contextType, UUID contextId);
    List<Document> findByOwnerId(UUID ownerId);
    Optional<Document> findByProviderFileId(String providerFileId);
}
