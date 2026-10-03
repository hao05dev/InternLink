CREATE TABLE notification_preferences (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    email_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    workflow_email BOOLEAN NOT NULL DEFAULT TRUE,
    reminder_email BOOLEAN NOT NULL DEFAULT TRUE,
    announcement_email BOOLEAN NOT NULL DEFAULT FALSE,
    system_email BOOLEAN NOT NULL DEFAULT TRUE
);
CREATE TABLE email_outbox (
    id UUID PRIMARY KEY,
    notification_id UUID REFERENCES notifications(id) ON DELETE CASCADE,
    recipient_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    recipient_email VARCHAR(254) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    event_type VARCHAR(50) NOT NULL,
    idempotency_key VARCHAR(200) NOT NULL UNIQUE,
    status VARCHAR(20) NOT NULL CHECK (status IN ('PENDING','SENDING','RETRY','SENT','FAILED','UNKNOWN','SKIPPED')),
    attempts INTEGER NOT NULL DEFAULT 0 CHECK (attempts >= 0),
    next_attempt_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    lease_token UUID,
    lease_until TIMESTAMPTZ,
    provider_message_id VARCHAR(300),
    last_error_code VARCHAR(100),
    sent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_email_outbox_ready ON email_outbox(next_attempt_at,created_at) WHERE status IN ('PENDING','RETRY');
CREATE INDEX idx_email_outbox_status ON email_outbox(status);
-- Existing storage_provider is VARCHAR with no enum CHECK. LOCAL/GOOGLE_DRIVE documents remain readable.
