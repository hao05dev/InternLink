-- ====================================================================
-- Migration V22: Add lifecycle and expiration columns to job_positions
-- Supports point-in-time evaluation, hard deterministic filtering,
-- and early closing capability while preserving historical records.
-- ====================================================================

ALTER TABLE job_positions
ADD COLUMN IF NOT EXISTS application_deadline TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS closed_early_at TIMESTAMPTZ;

-- Backfill application_deadline from corresponding internship_terms if currently null
UPDATE job_positions jp
SET application_deadline = t.application_deadline
FROM internship_terms t
WHERE jp.term_id = t.id AND jp.application_deadline IS NULL;

-- Create index to optimize active job searches and filtering by deadline and status
CREATE INDEX IF NOT EXISTS idx_job_positions_status_deadline 
ON job_positions(status, application_deadline, closed_early_at);
