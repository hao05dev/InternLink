ALTER TABLE email_outbox DROP CONSTRAINT IF EXISTS email_outbox_status_check;

UPDATE email_outbox SET status = 'ACCEPTED' WHERE status = 'SENT';

ALTER TABLE email_outbox
    ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS bounced_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS last_provider_event_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS provider_event JSONB NOT NULL DEFAULT '{}'::jsonb;

ALTER TABLE email_outbox
    ADD CONSTRAINT email_outbox_status_check CHECK (
        status IN (
            'PENDING', 'SENDING', 'RETRY', 'ACCEPTED', 'DELIVERED',
            'BOUNCED', 'FAILED', 'UNKNOWN', 'SKIPPED'
        )
    );

CREATE INDEX IF NOT EXISTS idx_email_outbox_provider_message
    ON email_outbox(provider_message_id)
    WHERE provider_message_id IS NOT NULL;

ALTER TABLE password_reset_tokens
    ADD COLUMN IF NOT EXISTS purpose VARCHAR(30) NOT NULL DEFAULT 'PASSWORD_RESET';

ALTER TABLE password_reset_tokens DROP CONSTRAINT IF EXISTS password_reset_tokens_purpose_check;
ALTER TABLE password_reset_tokens
    ADD CONSTRAINT password_reset_tokens_purpose_check
    CHECK (purpose IN ('PASSWORD_RESET', 'ACCOUNT_ACTIVATION'));
