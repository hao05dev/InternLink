package com.internlink.core.infrastructure.persistence.jdbc;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;
import java.sql.*;
import java.time.OffsetDateTime;
import java.util.*;

@Repository
public class EmailTemplateRepository {
    public record Template(
            UUID id, String code, String name, String purpose, String ownerScope, UUID ownerId,
            String status, int version, UUID versionId, String subject, String body,
            List<String> variables, OffsetDateTime updatedAt) {}

    private final JdbcTemplate jdbc;
    private final TransactionTemplate transaction;
    private final ObjectMapper mapper;

    public EmailTemplateRepository(JdbcTemplate jdbc, PlatformTransactionManager manager, ObjectMapper mapper) {
        this.jdbc = jdbc;
        this.transaction = new TransactionTemplate(manager);
        this.mapper = mapper;
    }

    public List<Template> available(String purpose, String ownerScope, UUID ownerId, boolean all) {
        var conditions = new ArrayList<String>();
        var params = new ArrayList<Object>();
        if (purpose != null && !purpose.isBlank()) {
            conditions.add("t.purpose=?");
            params.add(purpose);
        }
        if (!all) {
            conditions.add("(t.owner_scope='SYSTEM' OR (t.owner_scope=? AND t.owner_id=?))");
            params.add(ownerScope);
            params.add(ownerId);
        }
        String where = conditions.isEmpty() ? "" : " WHERE " + String.join(" AND ", conditions);
        return jdbc.query(select() + where + " ORDER BY t.status,t.name", this::map, params.toArray());
    }

    public Optional<Template> find(UUID id) {
        var rows = jdbc.query(select() + " WHERE t.id=?", this::map, id);
        return rows.stream().findFirst();
    }

    public Template create(
            String code, String name, String purpose, String scope, UUID ownerId,
            String subject, String body, List<String> variables, UUID actor) {
        UUID id = UUID.randomUUID();
        UUID versionId = UUID.randomUUID();
        try {
            transaction.executeWithoutResult(tx -> {
                jdbc.update("""
INSERT INTO email_templates(id,code,name,purpose,owner_scope,owner_id,status,current_version,created_by)
VALUES(?,?,?,?,?,?,'ACTIVE',1,?)
""", id, code, name, purpose, scope, ownerId, actor);
                insertVersion(versionId, id, 1, subject, body, variables, actor);
            });
        } catch (DataIntegrityViolationException ex) {
            throw new com.internlink.core.shared.exception.BadRequestException("Mã template đã tồn tại trong phạm vi này");
        }
        return find(id).orElseThrow();
    }

    public Template update(
            Template current, String name, String subject, String body,
            List<String> variables, UUID actor) {
        int version = current.version() + 1;
        transaction.executeWithoutResult(tx -> {
            jdbc.update("UPDATE email_templates SET name=?,status='ACTIVE',current_version=?,updated_at=NOW() WHERE id=?",
                    name, version, current.id());
            insertVersion(UUID.randomUUID(), current.id(), version, subject, body, variables, actor);
        });
        return find(current.id()).orElseThrow();
    }

    public void archive(UUID id) {
        jdbc.update("UPDATE email_templates SET status='ARCHIVED',updated_at=NOW() WHERE id=?", id);
    }

    private void insertVersion(
            UUID id, UUID templateId, int version, String subject, String body,
            List<String> variables, UUID actor) {
        try {
            jdbc.update("""
INSERT INTO email_template_versions(id,template_id,version,subject_template,body_template,variables_schema,created_by)
VALUES(?,?,?,?,?,?::jsonb,?)
""", id, templateId, version, subject, body, mapper.writeValueAsString(variables), actor);
        } catch (com.fasterxml.jackson.core.JsonProcessingException ex) {
            throw new IllegalStateException(ex);
        }
    }

    private String select() {
        return """
SELECT t.*,v.id AS version_id,v.subject_template,v.body_template,v.variables_schema::text AS variables
FROM email_templates t JOIN email_template_versions v ON v.template_id=t.id AND v.version=t.current_version
""";
    }

    private Template map(ResultSet rs, int index) throws SQLException {
        try {
            return new Template(
                    uuid(rs, "id"), rs.getString("code"), rs.getString("name"), rs.getString("purpose"),
                    rs.getString("owner_scope"), uuid(rs, "owner_id"), rs.getString("status"),
                    rs.getInt("current_version"), uuid(rs, "version_id"), rs.getString("subject_template"),
                    rs.getString("body_template"), mapper.readValue(rs.getString("variables"), new TypeReference<>() {}),
                    rs.getObject("updated_at", OffsetDateTime.class));
        } catch (com.fasterxml.jackson.core.JsonProcessingException ex) {
            throw new SQLException("Invalid template variables", ex);
        }
    }

    private static UUID uuid(ResultSet rs, String column) throws SQLException {
        String value = rs.getString(column);
        return value == null ? null : UUID.fromString(value);
    }
}
