CREATE TABLE media_assets (
 id UUID PRIMARY KEY,
 owner_user_id UUID NOT NULL REFERENCES users(id),
 purpose VARCHAR(32) NOT NULL CHECK(purpose IN('JOB_BANNER','JOB_IMAGE','JOB_ATTACHMENT','POST_COVER','POST_IMAGE','POST_ATTACHMENT','PORTFOLIO_IMAGE')),
 context_id UUID,
 scope VARCHAR(16),
 provider_file_id TEXT NOT NULL UNIQUE,
 file_name VARCHAR(255) NOT NULL,
 mime_type VARCHAR(120) NOT NULL,
 size_bytes BIGINT NOT NULL CHECK(size_bytes>0 AND size_bytes<=20971520),
 checksum VARCHAR(64) NOT NULL,
 created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
 CHECK((purpose='PORTFOLIO_IMAGE' AND context_id IS NOT NULL AND scope IN('DAILY','M01','M02','M03','M04','M05')) OR purpose<>'PORTFOLIO_IMAGE')
);
CREATE INDEX idx_media_owner_created ON media_assets(owner_user_id,created_at DESC);
CREATE INDEX idx_media_context ON media_assets(purpose,context_id);
ALTER TABLE job_positions ADD COLUMN banner_url TEXT;
ALTER TABLE job_positions ADD COLUMN attachment_urls JSONB NOT NULL DEFAULT '[]'::jsonb;
