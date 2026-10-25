-- V39: Them GPA, So dien thoai cho student_rosters va bang han muc giang vien huong dan (faculty_lecturer_quotas)

ALTER TABLE student_rosters
    ADD COLUMN IF NOT EXISTS gpa NUMERIC(3,2),
    ADD COLUMN IF NOT EXISTS phone_number VARCHAR(20);

CREATE TABLE IF NOT EXISTS faculty_lecturer_quotas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    term_id UUID NOT NULL REFERENCES internship_terms(id) ON DELETE CASCADE,
    lecturer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    max_students INT NOT NULL DEFAULT 15,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    version INT NOT NULL DEFAULT 0,
    CONSTRAINT uq_faculty_lecturer_term_quota UNIQUE(term_id, lecturer_id)
);

CREATE INDEX IF NOT EXISTS idx_faculty_lecturer_quota_term ON faculty_lecturer_quotas(term_id);
CREATE INDEX IF NOT EXISTS idx_faculty_lecturer_quota_lecturer ON faculty_lecturer_quotas(lecturer_id);
