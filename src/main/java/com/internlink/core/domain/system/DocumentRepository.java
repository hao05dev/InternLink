package com.internlink.core.domain.system;

import com.internlink.core.common.enums.ContextType;
import com.internlink.core.domain.system.Document;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface DocumentRepository extends JpaRepository<Document, UUID> {
    List<Document> findByContextTypeAndContextId(ContextType contextType, UUID contextId);
    List<Document> findByOwnerId(UUID ownerId);
    Optional<Document> findByProviderFileId(String providerFileId);
}
