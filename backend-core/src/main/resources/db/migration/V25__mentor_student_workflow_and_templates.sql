-- V25: Support flexible mentor supervision, daily journal verification source, and downloadable faculty report templates

ALTER TABLE internship_placements
ADD COLUMN IF NOT EXISTS supervision_mode VARCHAR(30) NOT NULL DEFAULT 'ACADEMIC_FOLLOWUP'
CHECK (supervision_mode IN ('ACADEMIC_FOLLOWUP', 'MENTOR_ONLINE'));

ALTER TABLE daily_journals
ADD COLUMN IF NOT EXISTS verification_source VARCHAR(30) NOT NULL DEFAULT 'STUDENT_REPORTED'
CHECK (verification_source IN ('STUDENT_REPORTED', 'MENTOR_VERIFIED', 'LECTURER_ACKNOWLEDGED'));

CREATE TABLE IF NOT EXISTS report_template_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    term_id UUID NOT NULL REFERENCES internship_terms(id),
    department_id UUID REFERENCES departments(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    report_type VARCHAR(50) NOT NULL CHECK (report_type IN ('M01', 'M02', 'M03', 'M04', 'M05', 'WEEKLY_REPORT', 'FINAL_REPORT', 'OTHER')),
    file_url VARCHAR(500) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_size_bytes BIGINT NOT NULL DEFAULT 0,
    mime_type VARCHAR(100) NOT NULL DEFAULT 'application/octet-stream',
    version_number INT NOT NULL DEFAULT 1,
    is_mandatory BOOLEAN NOT NULL DEFAULT true,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    version INT NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_report_templates_term ON report_template_versions(term_id);
CREATE INDEX IF NOT EXISTS idx_report_templates_department ON report_template_versions(department_id);
CREATE INDEX IF NOT EXISTS idx_report_templates_type ON report_template_versions(report_type);
