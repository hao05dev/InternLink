CREATE TABLE document_crypto_envelopes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL UNIQUE REFERENCES documents(id) ON DELETE CASCADE,
    format_version INT NOT NULL DEFAULT 1,
    data_algorithm VARCHAR(50) NOT NULL DEFAULT 'AES-256-GCM',
    wrap_algorithm VARCHAR(100) NOT NULL DEFAULT 'RSA-OAEP-SHA256-MGF1SHA256',
    key_id VARCHAR(100) NOT NULL,
    wrapped_dek_b64 TEXT NOT NULL,
    nonce_b64 VARCHAR(50) NOT NULL,
    tag_b64 VARCHAR(50) NOT NULL,
    aad_digest_sha256 VARCHAR(64) NOT NULL,
    ciphertext_size_bytes BIGINT NOT NULL,
    version INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_doc_crypto_document_id ON document_crypto_envelopes(document_id);
CREATE INDEX idx_doc_crypto_key_id ON document_crypto_envelopes(key_id);
