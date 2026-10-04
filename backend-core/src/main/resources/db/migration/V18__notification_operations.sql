CREATE TABLE email_delivery_control (
    id INTEGER PRIMARY KEY CHECK(id=1),
    paused BOOLEAN NOT NULL DEFAULT FALSE,
    daily_limit INTEGER NOT NULL DEFAULT 200 CHECK(daily_limit BETWEEN 1 AND 2000)
);
INSERT INTO email_delivery_control(id) VALUES(1);
CREATE TABLE email_attempt_reservations (
    id UUID PRIMARY KEY,
    sender_key VARCHAR(254) NOT NULL,
    reserved_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_email_attempt_sender_time ON email_attempt_reservations(sender_key,reserved_at);
CREATE TABLE notification_event_keys (
    event_key VARCHAR(250) PRIMARY KEY,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE notification_campaigns (
    id UUID PRIMARY KEY,
    term_id UUID NOT NULL REFERENCES internship_terms(id),
    created_by UUID NOT NULL REFERENCES users(id),
    request_key UUID NOT NULL,
    request_hash VARCHAR(64) NOT NULL,
    purpose VARCHAR(30) NOT NULL,
    audience VARCHAR(40) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    channel VARCHAR(15) NOT NULL CHECK(channel IN ('BOTH','IN_APP','EMAIL')),
    status VARCHAR(20) NOT NULL DEFAULT 'RUNNING' CHECK(status IN ('RUNNING','COMPLETED','CANCELLED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(created_by,request_key)
);
CREATE TABLE notification_campaign_recipients (
    id UUID PRIMARY KEY,
    campaign_id UUID NOT NULL REFERENCES notification_campaigns(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    email VARCHAR(254) NOT NULL,
    display_name VARCHAR(150) NOT NULL,
    student_code VARCHAR(50),
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING'
        CHECK(status IN ('PENDING','PROCESSING','QUEUED','SKIPPED','FAILED','UNKNOWN')),
    error_code VARCHAR(100),
    lease_token UUID,
    lease_until TIMESTAMPTZ,
    notification_id UUID REFERENCES notifications(id) ON DELETE SET NULL,
    outbox_id UUID REFERENCES email_outbox(id) ON DELETE SET NULL,
    UNIQUE(campaign_id,email)
);
CREATE INDEX idx_campaign_recipients_ready ON notification_campaign_recipients(campaign_id) WHERE status='PENDING';
-- Invalid legacy JSON deadline values must not abort a complete reminder batch.
CREATE FUNCTION internlink_try_timestamp(value TEXT) RETURNS TIMESTAMPTZ LANGUAGE plpgsql AS $$
BEGIN
    IF value IS NULL OR value !~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}T.*(Z|[+-][0-9]{2}:[0-9]{2})$' THEN RETURN NULL; END IF;
    RETURN value::TIMESTAMPTZ;
EXCEPTION WHEN OTHERS THEN
    RETURN NULL;
END;
$$;
