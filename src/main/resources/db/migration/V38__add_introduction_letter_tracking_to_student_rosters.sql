-- V38__add_introduction_letter_tracking_to_student_rosters.sql
-- Add physical introduction letter distribution tracking to student_rosters

ALTER TABLE student_rosters
    ADD COLUMN IF NOT EXISTS letter_received BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS letter_received_at TIMESTAMP WITH TIME ZONE,
    ADD COLUMN IF NOT EXISTS letter_notes TEXT;

CREATE INDEX IF NOT EXISTS idx_student_rosters_letter_received 
    ON student_rosters(term_id, letter_received);
