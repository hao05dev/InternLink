CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE embedding_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subject_type VARCHAR(30) NOT NULL CHECK (subject_type IN ('STUDENT_PROFILE', 'JOB_POSITION')),
    subject_id UUID NOT NULL,
    source_hash CHAR(64) NOT NULL CHECK (source_hash ~ '^[a-f0-9]{64}$'),
    source_version VARCHAR(100) NOT NULL,
    task VARCHAR(30) NOT NULL CHECK (task IN ('retrieval_query', 'retrieval_document')),
    model VARCHAR(200) NOT NULL,
    model_revision VARCHAR(200) NOT NULL,
    dimension INTEGER NOT NULL CHECK (dimension BETWEEN 1 AND 4096),
    chunk_policy VARCHAR(100) NOT NULL,
    embedding VECTOR NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT ck_embedding_dimension CHECK (vector_dims(embedding) = dimension),
    CONSTRAINT uk_embedding_cache UNIQUE (
        subject_type, subject_id, source_hash, task, model, model_revision, dimension, chunk_policy
    )
);

CREATE INDEX idx_embedding_records_subject
    ON embedding_records (subject_type, subject_id, created_at DESC);
