package com.internlink.core.infrastructure.persistence.jpa;

import com.internlink.core.domain.system.DocumentCryptoEnvelope;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface JpaDocumentCryptoEnvelopeRepository extends JpaRepository<DocumentCryptoEnvelope, UUID> {
    Optional<DocumentCryptoEnvelope> findByDocumentId(UUID documentId);
    boolean existsByDocumentId(UUID documentId);
    void deleteByDocumentId(UUID documentId);
}
