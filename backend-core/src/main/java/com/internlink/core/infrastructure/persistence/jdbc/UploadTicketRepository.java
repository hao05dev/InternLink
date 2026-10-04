package com.internlink.core.infrastructure.persistence.jdbc;

import com.internlink.core.shared.enums.*;
import com.internlink.core.shared.exception.*;

import lombok.RequiredArgsConstructor;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.time.OffsetDateTime;
import java.util.*;

@Repository
@RequiredArgsConstructor
public class UploadTicketRepository {
    private final JdbcTemplate jdbc;

    public record Ticket(
            UUID id,
            UUID owner,
            ContextType contextType,
            UUID contextId,
            DocumentType documentType,
            String name,
            String mime,
            long size,
            String checksum,
            String key,
            String status,
            OffsetDateTime expires,
            UUID lease,
            UUID documentId) {}

    public long pending(UUID owner) {
        return Objects.requireNonNull(
                jdbc.queryForObject(
                        "SELECT count(*) FROM document_upload_tickets WHERE owner_id=? AND status"
                                + " IN('PENDING','VERIFYING') AND expires_at>NOW()",
                        Long.class,
                        owner));
    }

    public void lockOwner(UUID owner) {
        jdbc.queryForObject(
                "SELECT pg_advisory_xact_lock(hashtextextended(?,0))",
                Object.class,
                "upload:" + owner);
    }

    public void insert(Ticket ticket) {
        jdbc.update(
                "INSERT INTO"
                    + " document_upload_tickets(id,owner_id,context_type,context_id,document_type,file_name,mime_type,size_bytes,checksum,staging_key,expires_at)"
                    + " VALUES(?,?,?,?,?,?,?,?,?,?,?)",
                ticket.id(),
                ticket.owner(),
                ticket.contextType().name(),
                ticket.contextId(),
                ticket.documentType().name(),
                ticket.name(),
                ticket.mime(),
                ticket.size(),
                ticket.checksum(),
                ticket.key(),
                ticket.expires());
    }

    public Ticket get(UUID id, UUID owner, boolean lock) {
        var rows =
                jdbc.query(
                        "SELECT * FROM document_upload_tickets WHERE id=? AND owner_id=?"
                                + (lock ? " FOR UPDATE" : ""),
                        (rs, i) ->
                                new Ticket(
                                        UUID.fromString(rs.getString("id")),
                                        UUID.fromString(rs.getString("owner_id")),
                                        ContextType.valueOf(rs.getString("context_type")),
                                        UUID.fromString(rs.getString("context_id")),
                                        DocumentType.valueOf(rs.getString("document_type")),
                                        rs.getString("file_name"),
                                        rs.getString("mime_type"),
                                        rs.getLong("size_bytes"),
                                        rs.getString("checksum"),
                                        rs.getString("staging_key"),
                                        rs.getString("status"),
                                        rs.getObject("expires_at", OffsetDateTime.class),
                                        rs.getString("lease_token") == null
                                                ? null
                                                : UUID.fromString(rs.getString("lease_token")),
                                        rs.getString("document_id") == null
                                                ? null
                                                : UUID.fromString(rs.getString("document_id"))),
                        id,
                        owner);
        if (rows.isEmpty()) throw new ResourceNotFoundException("Upload", "id", id);
        return rows.getFirst();
    }

    public UUID claim(Ticket ticket) {
        UUID lease = UUID.randomUUID();
        int changed =
                jdbc.update(
                        "UPDATE document_upload_tickets SET"
                            + " status='VERIFYING',lease_token=?,lease_until=NOW()+INTERVAL '5"
                            + " minutes' WHERE id=? AND expires_at>NOW() AND (status='PENDING' OR"
                            + " (status='VERIFYING' AND lease_until<NOW()))",
                        lease,
                        ticket.id());
        if (changed != 1)
            throw new BadRequestException("Upload hết hạn, bị từ chối hoặc đang xác minh");
        return lease;
    }

    public boolean owns(UUID id, UUID lease) {
        return !jdbc.queryForList(
                        "SELECT id FROM document_upload_tickets WHERE id=? AND lease_token=? AND"
                            + " status='VERIFYING' AND lease_until>NOW() AND expires_at>NOW() FOR"
                            + " UPDATE",
                        id,
                        lease)
                .isEmpty();
    }

    public void finish(UUID id, UUID lease, String status, String error, UUID document) {
        jdbc.update(
                "UPDATE document_upload_tickets SET"
                    + " status=?,error_code=?,document_id=?,lease_token=NULL,lease_until=NULL WHERE"
                    + " id=? AND lease_token=? AND status='VERIFYING'",
                status,
                error,
                document,
                id,
                lease);
    }

    public boolean referenced(String key) {
        return Boolean.TRUE.equals(
                jdbc.queryForObject(
                        """
SELECT EXISTS(SELECT 1 FROM documents WHERE storage_provider='R2' AND provider_file_id=?
 UNION ALL SELECT 1 FROM media_assets WHERE provider_file_id=?
 UNION ALL SELECT 1 FROM portfolio_signed_files WHERE storage_provider='R2' AND provider_file_id=?
 UNION ALL SELECT 1 FROM document_upload_tickets WHERE staging_key=? AND expires_at>NOW() AND status IN('PENDING','VERIFYING'))
""",
                        Boolean.class,
                        key,
                        key,
                        key,
                        key));
    }

    public List<String> expired() {
        return jdbc.queryForList(
                "SELECT staging_key FROM document_upload_tickets WHERE expires_at<NOW()-INTERVAL"
                        + " '10 minutes' AND cleaned_at IS NULL AND (lease_until IS NULL OR"
                        + " lease_until<NOW()) ORDER BY expires_at LIMIT 100",
                String.class);
    }

    public void expire(String key) {
        jdbc.update(
                "UPDATE document_upload_tickets SET status=CASE WHEN status"
                    + " IN('PENDING','VERIFYING') THEN 'EXPIRED' ELSE status"
                    + " END,cleaned_at=NOW(),lease_token=NULL,lease_until=NULL WHERE staging_key=?"
                    + " AND expires_at<NOW()",
                key);
    }

    public List<Map<String, Object>> failures() {
        return jdbc.queryForList(
                "SELECT id,status,error_code,created_at FROM document_upload_tickets WHERE status"
                        + " IN('REJECTED','EXPIRED') ORDER BY created_at DESC LIMIT 50");
    }
}
