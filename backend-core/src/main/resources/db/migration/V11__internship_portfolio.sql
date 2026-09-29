CREATE TABLE daily_journals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    placement_id UUID NOT NULL REFERENCES internship_placements(id),
    work_date DATE NOT NULL,
    attendance VARCHAR(20) NOT NULL CHECK (attendance IN ('PRESENT','REMOTE','LEAVE','ABSENT','DAY_OFF')),
    start_time TIME, end_time TIME,
    break_minutes INT NOT NULL DEFAULT 0 CHECK (break_minutes BETWEEN 0 AND 720),
    sessions INT NOT NULL DEFAULT 0 CHECK (sessions BETWEEN 0 AND 2),
    hours NUMERIC(5,2) NOT NULL DEFAULT 0 CHECK (hours BETWEEN 0 AND 24),
    tasks TEXT NOT NULL DEFAULT '', results TEXT NOT NULL DEFAULT '', reflection TEXT NOT NULL DEFAULT '',
    evidence TEXT NOT NULL DEFAULT '',
    status VARCHAR(25) NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT','SUBMITTED','CONFIRMED','REVISION_REQUIRED')),
    review_note TEXT, reviewed_by UUID REFERENCES users(id), reviewed_at TIMESTAMPTZ, submitted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), version INT NOT NULL DEFAULT 0,
    UNIQUE (placement_id, work_date)
);
CREATE TABLE portfolio_forms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(), placement_id UUID NOT NULL REFERENCES internship_placements(id),
    kind VARCHAR(8) NOT NULL CHECK (kind IN ('M01','M02','M03','M04','M05')),
    template_version VARCHAR(40) NOT NULL DEFAULT 'CTU-2026-v1',
    content JSONB NOT NULL DEFAULT '{}'::jsonb,
    status VARCHAR(25) NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT','SUBMITTED','COMPLETED','APPROVED','REVISION_REQUIRED')),
    published BOOLEAN NOT NULL DEFAULT FALSE, published_by UUID REFERENCES users(id), published_at TIMESTAMPTZ,
    feedback TEXT, updated_by UUID REFERENCES users(id), report_id UUID REFERENCES internship_reports(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), version INT NOT NULL DEFAULT 0,
    UNIQUE (placement_id, kind)
);
CREATE TABLE portfolio_revisions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(), form_id UUID NOT NULL REFERENCES portfolio_forms(id),
    action VARCHAR(30) NOT NULL, content JSONB NOT NULL, docx BYTEA,
    actor_id UUID NOT NULL REFERENCES users(id), note TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), version INT NOT NULL DEFAULT 0
);
CREATE TABLE portfolio_signed_files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(), form_id UUID NOT NULL REFERENCES portfolio_forms(id),
    revision_id UUID NOT NULL REFERENCES portfolio_revisions(id),
    file_name VARCHAR(255) NOT NULL, mime_type VARCHAR(100) NOT NULL, bytes BYTEA NOT NULL,
    uploaded_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), version INT NOT NULL DEFAULT 0
);
CREATE INDEX idx_journal_placement_date ON daily_journals(placement_id,work_date);
CREATE INDEX idx_portfolio_revision_form ON portfolio_revisions(form_id,created_at);
