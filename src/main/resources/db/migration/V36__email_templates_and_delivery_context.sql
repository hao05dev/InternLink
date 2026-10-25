CREATE TABLE email_templates (
    id UUID PRIMARY KEY,
    code VARCHAR(80) NOT NULL,
    name VARCHAR(150) NOT NULL,
    purpose VARCHAR(40) NOT NULL,
    owner_scope VARCHAR(20) NOT NULL CHECK (owner_scope IN ('SYSTEM','DEPARTMENT','COMPANY')),
    owner_id UUID,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE','ARCHIVED')),
    current_version INTEGER NOT NULL DEFAULT 1 CHECK (current_version > 0),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CHECK ((owner_scope='SYSTEM' AND owner_id IS NULL) OR (owner_scope<>'SYSTEM' AND owner_id IS NOT NULL))
);

CREATE UNIQUE INDEX uq_email_template_scope_code
    ON email_templates(owner_scope, COALESCE(owner_id, '00000000-0000-0000-0000-000000000000'::uuid), code);
CREATE INDEX idx_email_template_owner ON email_templates(owner_scope, owner_id, status);

CREATE TABLE email_template_versions (
    id UUID PRIMARY KEY,
    template_id UUID NOT NULL REFERENCES email_templates(id) ON DELETE CASCADE,
    version INTEGER NOT NULL CHECK (version > 0),
    subject_template VARCHAR(255) NOT NULL,
    body_template TEXT NOT NULL,
    variables_schema JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(template_id, version)
);

ALTER TABLE notification_campaigns
    ADD COLUMN template_version_id UUID REFERENCES email_template_versions(id) ON DELETE SET NULL;

ALTER TABLE email_outbox
    ADD COLUMN template_version_id UUID REFERENCES email_template_versions(id) ON DELETE SET NULL,
    ADD COLUMN initiated_by UUID REFERENCES users(id) ON DELETE SET NULL,
    ADD COLUMN source_type VARCHAR(40),
    ADD COLUMN source_id UUID,
    ADD COLUMN scope_type VARCHAR(20),
    ADD COLUMN scope_id UUID;

CREATE INDEX idx_email_outbox_context
    ON email_outbox(scope_type, scope_id, source_type, created_at DESC);
CREATE INDEX idx_email_outbox_template_version ON email_outbox(template_version_id);

INSERT INTO email_templates(id, code, name, purpose, owner_scope, status)
VALUES
    ('3a4e8d34-90aa-4ec4-a422-7d7493550031', 'INTERVIEW_INVITATION', 'Mời phỏng vấn mặc định', 'INTERVIEW_INVITATION', 'SYSTEM', 'ACTIVE'),
    ('3a4e8d34-90aa-4ec4-a422-7d7493550032', 'STUDENT_GENERAL_NOTICE', 'Thông báo chung cho sinh viên', 'GENERAL', 'SYSTEM', 'ACTIVE'),
    ('3a4e8d34-90aa-4ec4-a422-7d7493550033', 'FACULTY_STUDENT_NOTICE', 'Thông báo sinh viên của khoa', 'FACULTY_NOTICE', 'SYSTEM', 'ACTIVE');

INSERT INTO email_template_versions(id, template_id, version, subject_template, body_template, variables_schema)
VALUES
    ('4b5f9e45-a1bb-4fd5-b533-8e8504661041', '3a4e8d34-90aa-4ec4-a422-7d7493550031', 1,
     '[{{company.name}}] Mời phỏng vấn vị trí {{job.title}}',
     E'Xin chào {{student.fullName}},\n\n{{company.name}} trân trọng mời bạn tham gia phỏng vấn vị trí {{job.title}}.\n\nThời gian: {{interview.scheduledAt}}\nHình thức: {{interview.format}}\nĐịa điểm/Phòng họp: {{interview.destination}}\nNgười phỏng vấn: {{interview.interviewer}}\nGhi chú: {{interview.notes}}\n\nVui lòng kiểm tra thông tin trong InternLink: {{actionUrl}}',
     '["student.fullName","company.name","job.title","interview.scheduledAt","interview.format","interview.destination","interview.interviewer","interview.notes","actionUrl"]'::jsonb),
    ('4b5f9e45-a1bb-4fd5-b533-8e8504661042', '3a4e8d34-90aa-4ec4-a422-7d7493550032', 1,
     '[InternLink] {{termName}} - Thông báo dành cho sinh viên',
     E'Xin chào {{studentName}},\n\n[Nội dung thông báo]\n\nTrân trọng,\nInternLink',
     '["studentName","termName"]'::jsonb),
    ('4b5f9e45-a1bb-4fd5-b533-8e8504661043', '3a4e8d34-90aa-4ec4-a422-7d7493550033', 1,
     '[InternLink] {{termName}} - Thông báo từ khoa',
     E'Xin chào {{studentName}} ({{studentCode}}),\n\n[Nội dung thông báo]\n\nTrân trọng,\nBan quản lý thực tập',
     '["studentName","studentCode","termName"]'::jsonb);
