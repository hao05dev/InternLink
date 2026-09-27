-- Academic assessment is configured per program, cohort and internship term.
ALTER TABLE academic_programs ADD COLUMN track VARCHAR(20) NOT NULL DEFAULT 'REGULAR'
    CHECK (track IN ('REGULAR', 'CTCLC'));
UPDATE academic_programs SET track = 'CTCLC'
    WHERE UPPER(code) LIKE '%CLC%' OR UPPER(name) LIKE '%CTCLC%' OR UPPER(name) LIKE '%CHẤT LƯỢNG CAO%';
ALTER TABLE student_rosters ADD COLUMN internship_course_code VARCHAR(30);

CREATE TABLE assessment_schemes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    term_id UUID NOT NULL REFERENCES internship_terms(id) ON DELETE RESTRICT,
    program_id UUID NOT NULL REFERENCES academic_programs(id) ON DELETE RESTRICT,
    cohort_code VARCHAR(30) NOT NULL,
    course_code VARCHAR(30) NOT NULL,
    revision INT NOT NULL CHECK (revision > 0),
    source_reference TEXT NOT NULL,
    components JSONB NOT NULL,
    required_logbook_weeks INT NOT NULL CHECK (required_logbook_weeks > 0),
    weekly_grace_days INT NOT NULL DEFAULT 0 CHECK (weekly_grace_days >= 0),
    require_midterm_report BOOLEAN NOT NULL DEFAULT FALSE,
    require_final_report BOOLEAN NOT NULL DEFAULT TRUE,
    midterm_report_due_at TIMESTAMPTZ,
    final_report_due_at TIMESTAMPTZ,
    status VARCHAR(20) NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'APPROVED', 'RETIRED')),
    approved_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    approved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    version INT NOT NULL DEFAULT 0,
    CONSTRAINT uq_assessment_scheme_revision UNIQUE (term_id, program_id, cohort_code, course_code, revision)
);
CREATE UNIQUE INDEX uq_assessment_scheme_approved
    ON assessment_schemes(term_id, program_id, cohort_code, course_code) WHERE status = 'APPROVED';

CREATE TABLE student_found_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    term_id UUID NOT NULL REFERENCES internship_terms(id) ON DELETE RESTRICT,
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    host_name VARCHAR(255) NOT NULL,
    host_address TEXT NOT NULL,
    contact_name VARCHAR(150) NOT NULL,
    contact_email VARCHAR(150) NOT NULL,
    work_description TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    acceptance_document_id UUID REFERENCES documents(id) ON DELETE RESTRICT,
    status VARCHAR(25) NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'SUBMITTED', 'REVISION_REQUIRED', 'APPROVED', 'REJECTED')),
    review_note TEXT,
    reviewed_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    version INT NOT NULL DEFAULT 0,
    CONSTRAINT chk_student_found_dates CHECK (start_date <= end_date),
    CONSTRAINT uq_student_found_term_student UNIQUE (term_id, student_id)
);

ALTER TABLE internship_placements ALTER COLUMN agreement_id DROP NOT NULL;
ALTER TABLE internship_placements ALTER COLUMN company_id DROP NOT NULL;
ALTER TABLE internship_placements ALTER COLUMN mentor_id DROP NOT NULL;
ALTER TABLE internship_placements ADD COLUMN source VARCHAR(20) NOT NULL DEFAULT 'PARTNER_PORTAL'
    CHECK (source IN ('PARTNER_PORTAL', 'STUDENT_FOUND'));
ALTER TABLE internship_placements ADD COLUMN student_found_application_id UUID UNIQUE
    REFERENCES student_found_applications(id) ON DELETE RESTRICT;
ALTER TABLE internship_placements ADD COLUMN assessment_scheme_id UUID
    REFERENCES assessment_schemes(id) ON DELETE RESTRICT;
ALTER TABLE internship_placements ADD CONSTRAINT chk_placement_source
    CHECK ((source = 'PARTNER_PORTAL' AND agreement_id IS NOT NULL AND company_id IS NOT NULL AND mentor_id IS NOT NULL AND student_found_application_id IS NULL)
        OR (source = 'STUDENT_FOUND' AND agreement_id IS NULL AND mentor_id IS NULL AND student_found_application_id IS NOT NULL));

ALTER TABLE weekly_logbooks DROP CONSTRAINT IF EXISTS weekly_logbooks_status_check;
ALTER TABLE weekly_logbooks ADD CONSTRAINT weekly_logbooks_status_check
    CHECK (status IN ('DRAFT', 'SUBMITTED', 'APPROVED_BY_MENTOR', 'APPROVED_BY_LECTURER', 'REVISION_REQUESTED'));
ALTER TABLE weekly_logbooks ADD COLUMN was_late BOOLEAN NOT NULL DEFAULT FALSE;

CREATE TABLE internship_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    placement_id UUID NOT NULL REFERENCES internship_placements(id) ON DELETE CASCADE,
    report_type VARCHAR(20) NOT NULL CHECK (report_type IN ('MIDTERM', 'FINAL')),
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE RESTRICT,
    status VARCHAR(25) NOT NULL DEFAULT 'SUBMITTED' CHECK (status IN ('SUBMITTED', 'REVISION_REQUIRED', 'APPROVED')),
    lecturer_feedback TEXT,
    was_late BOOLEAN NOT NULL DEFAULT FALSE,
    reviewed_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMPTZ,
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    version INT NOT NULL DEFAULT 0,
    CONSTRAINT uq_internship_report_type UNIQUE (placement_id, report_type)
);

CREATE TABLE assessment_component_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    placement_id UUID NOT NULL REFERENCES internship_placements(id) ON DELETE CASCADE,
    component_code VARCHAR(50) NOT NULL,
    score NUMERIC(4,1) NOT NULL CHECK (score >= 0 AND score <= 10),
    criteria_scores JSONB NOT NULL DEFAULT '{}'::jsonb,
    source VARCHAR(20) NOT NULL CHECK (source IN ('ONLINE', 'OFFLINE')),
    evidence_document_id UUID REFERENCES documents(id) ON DELETE RESTRICT,
    status VARCHAR(20) NOT NULL CHECK (status IN ('PENDING_VERIFICATION', 'VERIFIED')),
    submitted_by_user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    verified_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    version INT NOT NULL DEFAULT 0,
    CONSTRAINT uq_component_score UNIQUE (placement_id, component_code),
    CONSTRAINT chk_offline_evidence CHECK (source <> 'OFFLINE' OR evidence_document_id IS NOT NULL)
);
