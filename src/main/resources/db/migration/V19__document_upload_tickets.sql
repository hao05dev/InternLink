CREATE TABLE document_upload_tickets (
 id UUID PRIMARY KEY, owner_id UUID NOT NULL REFERENCES users(id), context_type VARCHAR(30) NOT NULL,
 context_id UUID NOT NULL, document_type VARCHAR(30) NOT NULL, file_name VARCHAR(180) NOT NULL,
 mime_type VARCHAR(150) NOT NULL, size_bytes BIGINT NOT NULL CHECK(size_bytes>0 AND size_bytes<=20971520),
 checksum VARCHAR(64) NOT NULL, staging_key VARCHAR(500) NOT NULL UNIQUE,
 status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK(status IN('PENDING','VERIFYING','COMPLETED','REJECTED','EXPIRED')),
 expires_at TIMESTAMPTZ NOT NULL, lease_token UUID, lease_until TIMESTAMPTZ, document_id UUID REFERENCES documents(id),
 error_code VARCHAR(100), cleaned_at TIMESTAMPTZ, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_upload_ticket_cleanup ON document_upload_tickets(status,expires_at);
ALTER TABLE portfolio_signed_files ALTER COLUMN bytes DROP NOT NULL;
ALTER TABLE portfolio_signed_files ADD COLUMN storage_provider VARCHAR(30);
ALTER TABLE portfolio_signed_files ADD COLUMN provider_file_id VARCHAR(500);
ALTER TABLE portfolio_signed_files ADD COLUMN provider_folder_id VARCHAR(500);
ALTER TABLE portfolio_signed_files ADD COLUMN size_bytes BIGINT;
ALTER TABLE portfolio_signed_files ADD COLUMN checksum VARCHAR(64);
ALTER TABLE portfolio_signed_files ADD CONSTRAINT ck_signed_file_content CHECK (
 bytes IS NOT NULL OR (storage_provider IS NOT NULL AND provider_file_id IS NOT NULL)
);
