package com.internlink.core.infrastructure.persistence.jdbc;

import com.internlink.core.presentation.system.dto.request.NotificationCampaignRequest;
import com.internlink.core.presentation.system.dto.response.NotificationCampaignResponse.*;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;

import java.sql.*;
import java.time.OffsetDateTime;
import java.util.*;

@Repository
public class NotificationCampaignRepository {
    private final JdbcTemplate jdbc;
    private final TransactionTemplate transaction;

    public record Target(UUID userId, String email, String name, String studentCode) {}

    public record Campaign(
            UUID id,
            UUID termId,
            UUID creator,
            String subject,
            String body,
            String channel,
            String purpose,
            String status) {}

    public record Work(
            UUID id,
            UUID campaignId,
            UUID userId,
            String email,
            String name,
            String code,
            UUID lease) {}

    public NotificationCampaignRepository(
            JdbcTemplate jdbc, PlatformTransactionManager transactions) {
        this.jdbc = jdbc;
        this.transaction = new TransactionTemplate(transactions);
    }

    public List<Target> audience(UUID term, String audience) {
        if (Set.of("ELIGIBLE", "INELIGIBLE", "ALL_STUDENTS").contains(audience)) {
            String filter =
                    switch (audience) {
                        case "ELIGIBLE" -> " AND r.eligibility_status='ELIGIBLE'";
                        case "INELIGIBLE" -> " AND r.eligibility_status='INELIGIBLE'";
                        default -> "";
                    };
            return jdbc.query(
                    """
SELECT coalesce(claimed.id,registered.id) AS user_id,coalesce(claimed.email,registered.email,r.official_email) AS email,
    r.full_name AS name,r.student_code
FROM student_rosters r
LEFT JOIN users claimed ON claimed.id=r.claimed_user_id
LEFT JOIN users registered ON r.claimed_user_id IS NULL AND registered.email=r.official_email
WHERE r.term_id=? AND coalesce(claimed.is_active,registered.is_active,true)=true
"""
                            + filter
                            + " ORDER BY r.student_code",
                    (rs, i) ->
                            new Target(
                                    uuid(rs, "user_id"),
                                    rs.getString("email"),
                                    rs.getString("name"),
                                    rs.getString("student_code")),
                    term);
        }
        String role =
                switch (audience) {
                    case "MENTORS" -> "COMPANY_MENTOR";
                    case "LECTURERS" -> "LECTURER";
                    case "COMPANY_REPS" -> "COMPANY_REP";
                    case "FACULTY_ADMINS" -> "FACULTY_ADMIN";
                    case "ADMINS" -> "ADMIN";
                    default -> throw new IllegalArgumentException("invalid audience");
                };
        String scope =
                switch (audience) {
                    case "MENTORS" ->
                            "u.id IN (SELECT mentor_id FROM internship_placements WHERE term_id=?)";
                    case "LECTURERS" ->
                            "u.id IN (SELECT lecturer_id FROM internship_placements WHERE"
                                    + " term_id=?)";
                    case "COMPANY_REPS" ->
                            "u.company_id IN (SELECT company_id FROM internship_placements WHERE"
                                    + " term_id=? UNION SELECT company_id FROM job_positions WHERE"
                                    + " term_id=?)";
                    case "FACULTY_ADMINS" ->
                            "u.department_id IN (SELECT department_id FROM internship_terms WHERE"
                                    + " id=?)";
                    default -> "EXISTS(SELECT 1 FROM internship_terms WHERE id=?)";
                };
        Object[] params =
                audience.equals("COMPANY_REPS")
                        ? new Object[] {role, term, term}
                        : new Object[] {role, term};
        return jdbc.query(
                "SELECT u.id AS user_id,u.email,u.full_name AS name,NULL AS student_code FROM users"
                        + " u WHERE u.role=? AND u.is_active=true AND "
                        + scope
                        + " ORDER BY u.id",
                (rs, i) ->
                        new Target(
                                uuid(rs, "user_id"),
                                rs.getString("email"),
                                rs.getString("name"),
                                null),
                params);
    }

    public void lockRequest(UUID creator, UUID key) {
        jdbc.queryForObject(
                "SELECT pg_advisory_xact_lock(hashtextextended(?,0))",
                Object.class,
                creator + ":" + key);
    }

    public Optional<Map<String, Object>> byRequest(UUID creator, UUID key) {
        return jdbc
                .queryForList(
                        "SELECT id,request_hash FROM notification_campaigns WHERE created_by=? AND"
                                + " request_key=?",
                        creator,
                        key)
                .stream()
                .findFirst();
    }

    public UUID create(
            UUID creator, String hash, NotificationCampaignRequest request, List<Target> targets) {
        UUID id = UUID.randomUUID();
        jdbc.update(
                """
INSERT INTO notification_campaigns(id,term_id,created_by,request_key,request_hash,purpose,audience,subject,body,channel)
VALUES(?,?,?,?,?,?,?,?,?,?)
""",
                id,
                request.termId(),
                creator,
                request.requestKey(),
                hash,
                request.purpose(),
                request.audience(),
                request.subject(),
                request.body(),
                request.channel());
        for (var target : targets)
            jdbc.update(
                    """
INSERT INTO notification_campaign_recipients(id,campaign_id,user_id,email,display_name,student_code) VALUES(?,?,?,?,?,?)
ON CONFLICT(campaign_id,email) DO NOTHING
""",
                    UUID.randomUUID(),
                    id,
                    target.userId(),
                    target.email().strip().toLowerCase(Locale.ROOT),
                    target.name(),
                    target.studentCode());
        return id;
    }

    public Campaign campaign(UUID id, boolean lock) {
        var rows =
                jdbc.query(
                        "SELECT * FROM notification_campaigns WHERE id=?"
                                + (lock ? " FOR UPDATE" : ""),
                        (rs, i) ->
                                new Campaign(
                                        uuid(rs, "id"),
                                        uuid(rs, "term_id"),
                                        uuid(rs, "created_by"),
                                        rs.getString("subject"),
                                        rs.getString("body"),
                                        rs.getString("channel"),
                                        rs.getString("purpose"),
                                        rs.getString("status")),
                        id);
        if (rows.isEmpty())
            throw new com.internlink.core.shared.exception.ResourceNotFoundException(
                    "Campaign", "id", id);
        return rows.getFirst();
    }

    public Work claim() {
        return transaction.execute(
                tx -> {
                    UUID lease = UUID.randomUUID();
                    var rows =
                            jdbc.query(
                                    """
UPDATE notification_campaign_recipients r SET status='PROCESSING',lease_token=?,lease_until=NOW()+INTERVAL '5 minutes'
WHERE r.id IN (
    SELECT r2.id FROM notification_campaign_recipients r2 JOIN notification_campaigns c ON c.id=r2.campaign_id
    WHERE c.status='RUNNING' AND r2.status='PENDING' ORDER BY c.created_at,r2.id LIMIT 1 FOR UPDATE OF r2 SKIP LOCKED)
RETURNING r.*
""",
                                    (rs, i) ->
                                            new Work(
                                                    uuid(rs, "id"),
                                                    uuid(rs, "campaign_id"),
                                                    uuid(rs, "user_id"),
                                                    rs.getString("email"),
                                                    rs.getString("display_name"),
                                                    rs.getString("student_code"),
                                                    uuid(rs, "lease_token")),
                                    lease);
                    return rows.isEmpty() ? null : rows.getFirst();
                });
    }

    public void recover() {
        jdbc.update(
                "UPDATE notification_campaign_recipients r SET status=CASE WHEN c.status='RUNNING'"
                    + " THEN 'PENDING' ELSE 'SKIPPED' END,lease_token=NULL,lease_until=NULL FROM"
                    + " notification_campaigns c WHERE c.id=r.campaign_id AND r.status='PROCESSING'"
                    + " AND r.lease_until<NOW()");
    }

    public boolean owns(Work row) {
        return !jdbc.queryForList(
                        "SELECT id FROM notification_campaign_recipients WHERE id=? AND"
                                + " status='PROCESSING' AND lease_token=? FOR UPDATE",
                        row.id(),
                        row.lease())
                .isEmpty();
    }

    public void finish(Work row, String state, String error) {
        jdbc.update(
                """
UPDATE notification_campaign_recipients SET status=?,error_code=?,lease_token=NULL,lease_until=NULL WHERE id=? AND lease_token=?
""",
                state,
                error,
                row.id(),
                row.lease());
        jdbc.update(
                """
UPDATE notification_campaigns c SET status='COMPLETED' WHERE id=? AND status='RUNNING'
    AND NOT EXISTS(SELECT 1 FROM notification_campaign_recipients r WHERE r.campaign_id=c.id AND r.status IN ('PENDING','PROCESSING'))
""",
                row.campaignId());
    }

    public void attachNotification(Work row, UUID notificationId) {
        jdbc.update(
                "UPDATE notification_campaign_recipients SET notification_id=?,outbox_id=(SELECT id"
                        + " FROM email_outbox WHERE notification_id=?) WHERE id=?",
                notificationId,
                notificationId,
                row.id());
    }

    public void attach(Work row, String emailKey) {
        jdbc.update(
                "UPDATE notification_campaign_recipients SET outbox_id=(SELECT id FROM email_outbox"
                        + " WHERE idempotency_key=?) WHERE id=?",
                emailKey,
                row.id());
    }

    public void cancel(UUID id) {
        jdbc.update("UPDATE notification_campaigns SET status='CANCELLED' WHERE id=?", id);
        jdbc.update(
                "UPDATE notification_campaign_recipients SET"
                    + " status='SKIPPED',error_code='campaign_cancelled' WHERE campaign_id=? AND"
                    + " status='PENDING'",
                id);
    }

    public void retryFailures(UUID id) {
        int changed =
                jdbc.update(
                        "UPDATE notification_campaign_recipients SET"
                                + " status='PENDING',error_code=NULL WHERE campaign_id=? AND"
                                + " status='FAILED'",
                        id);
        if (changed == 0)
            throw new com.internlink.core.shared.exception.BadRequestException(
                    "Không có người nhận lỗi để thử lại");
        jdbc.update(
                "UPDATE notification_campaigns SET status='RUNNING' WHERE id=? AND"
                        + " status='COMPLETED'",
                id);
    }

    public Detail detail(UUID id, int page, int size) {
        var item = item(id);
        long count =
                Objects.requireNonNull(
                        jdbc.queryForObject(
                                "SELECT count(*) FROM notification_campaign_recipients WHERE"
                                        + " campaign_id=?",
                                Long.class,
                                id));
        var recipients =
                jdbc.query(
                        """
SELECT r.*,o.status AS email_status FROM notification_campaign_recipients r LEFT JOIN email_outbox o ON o.id=r.outbox_id
WHERE campaign_id=? ORDER BY r.id LIMIT ? OFFSET ?
""",
                        (rs, i) ->
                                new Recipient(
                                        uuid(rs, "id"),
                                        uuid(rs, "user_id"),
                                        rs.getString("email"),
                                        rs.getString("display_name"),
                                        rs.getString("student_code"),
                                        rs.getString("status"),
                                        rs.getString("error_code"),
                                        rs.getString("email_status")),
                        id,
                        size,
                        (long) page * size);
        return new Detail(item, recipients, count, (int) ((count + size - 1) / size));
    }

    public Page page(UUID department, int page, int size) {
        String filter =
                department == null
                        ? ""
                        : " WHERE c.term_id IN (SELECT id FROM internship_terms WHERE"
                                + " department_id=?)";
        var args = new ArrayList<Object>();
        if (department != null) args.add(department);
        long count =
                Objects.requireNonNull(
                        jdbc.queryForObject(
                                "SELECT count(*) FROM notification_campaigns c" + filter,
                                Long.class,
                                args.toArray()));
        args.add(size);
        args.add((long) page * size);
        var ids =
                jdbc.query(
                        "SELECT c.id FROM notification_campaigns c"
                                + filter
                                + " ORDER BY created_at DESC LIMIT ? OFFSET ?",
                        (rs, i) -> uuid(rs, "id"),
                        args.toArray());
        return new Page(
                ids.stream().map(this::item).toList(), count, (int) ((count + size - 1) / size));
    }

    private Item item(UUID id) {
        Map<String, Long> counts = new LinkedHashMap<>();
        jdbc.query(
                "SELECT status,count(*) amount FROM notification_campaign_recipients WHERE"
                        + " campaign_id=? GROUP BY status",
                (org.springframework.jdbc.core.RowCallbackHandler)
                        rs -> counts.put(rs.getString("status"), rs.getLong("amount")),
                id);
        return jdbc.queryForObject(
                "SELECT * FROM notification_campaigns WHERE id=?",
                (rs, i) ->
                        new Item(
                                uuid(rs, "id"),
                                uuid(rs, "term_id"),
                                uuid(rs, "created_by"),
                                rs.getString("subject"),
                                rs.getString("purpose"),
                                rs.getString("channel"),
                                rs.getString("status"),
                                rs.getObject("created_at", OffsetDateTime.class),
                                counts),
                id);
    }

    private static UUID uuid(ResultSet rs, String column) throws SQLException {
        String text = rs.getString(column);
        return text == null ? null : UUID.fromString(text);
    }
}
