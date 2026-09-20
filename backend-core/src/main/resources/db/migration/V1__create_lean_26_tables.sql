-- ====================================================================
-- CTU INTERNLINK DATABASE SCHEMA - LEAN 26 TABLES (UUID STANDARD)
-- Project: InternLink - Platform for Internship Management & AI Matching
-- Baseline: Lean 26 Tables (Erasmus+, ILO 208, QAA, NACE, ESCO Taxonomy)
-- DBMS: PostgreSQL 16+ with pgvector extension
-- ====================================================================

-- 0. Extension pgvector & pgcrypto
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ====================================================================
-- 1. departments (Khoa / Don vi dao tao)
-- ====================================================================
CREATE TABLE IF NOT EXISTS departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(200) NOT NULL,
    contact_email VARCHAR(150) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ====================================================================
-- 2. academic_programs (Nganh / Chuong trinh dao tao)
-- ====================================================================
CREATE TABLE IF NOT EXISTS academic_programs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    department_id UUID NOT NULL REFERENCES departments(id) ON DELETE RESTRICT,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(200) NOT NULL,
    degree_level VARCHAR(30) NOT NULL DEFAULT 'UNDERGRADUATE',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ====================================================================
-- 3. companies (Doanh nghiep tiep nhan)
-- ====================================================================
CREATE TABLE IF NOT EXISTS companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_name VARCHAR(255) NOT NULL,
    tax_code VARCHAR(50) NOT NULL UNIQUE,
    industry VARCHAR(100),
    website VARCHAR(255),
    address JSONB NOT NULL,
    verification_status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    verification_detail JSONB NOT NULL DEFAULT '{}'::jsonb,
    verified_by_user_id UUID,
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    version INT NOT NULL DEFAULT 0
);

-- ====================================================================
-- 4. users (Tai khoan nguoi dung - 6 roles)
-- ====================================================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    auth_provider VARCHAR(20) NOT NULL DEFAULT 'LOCAL',
    google_subject VARCHAR(255) UNIQUE,
    email_verified_at TIMESTAMPTZ,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    phone_number VARCHAR(20),
    role VARCHAR(30) NOT NULL CHECK (role IN ('STUDENT', 'COMPANY_REP', 'COMPANY_MENTOR', 'LECTURER', 'FACULTY_ADMIN', 'ADMIN')),
    must_change_password BOOLEAN NOT NULL DEFAULT TRUE,
    password_changed_at TIMESTAMPTZ,
    last_login_at TIMESTAMPTZ,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    version INT NOT NULL DEFAULT 0
);

-- Add Foreign Key for companies.verified_by_user_id
ALTER TABLE companies
    ADD CONSTRAINT fk_companies_verified_by
    FOREIGN KEY (verified_by_user_id) REFERENCES users(id) ON DELETE SET NULL;

-- ====================================================================
-- 5. internship_terms (Ky thuc tap)
-- ====================================================================
CREATE TABLE IF NOT EXISTS internship_terms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    department_id UUID NOT NULL REFERENCES departments(id) ON DELETE RESTRICT,
    code VARCHAR(50) NOT NULL UNIQUE,
    term_name VARCHAR(150) NOT NULL,
    academic_year VARCHAR(20) NOT NULL,
    semester VARCHAR(20) NOT NULL,
    registration_open_at TIMESTAMPTZ NOT NULL,
    registration_close_at TIMESTAMPTZ NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    application_deadline TIMESTAMPTZ NOT NULL,
    evaluation_deadline TIMESTAMPTZ NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'REGISTRATION_OPEN', 'APPLICATION_OPEN', 'ACTIVE', 'EVALUATING', 'CLOSED')),
    settings JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    version INT NOT NULL DEFAULT 0
);

-- ====================================================================
-- 6. student_rosters (Danh sach sinh vien du dieu kien)
-- ====================================================================
CREATE TABLE IF NOT EXISTS student_rosters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    term_id UUID NOT NULL REFERENCES internship_terms(id) ON DELETE CASCADE,
    program_id UUID NOT NULL REFERENCES academic_programs(id) ON DELETE RESTRICT,
    student_code VARCHAR(50) NOT NULL,
    official_email VARCHAR(150) NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    academic_year VARCHAR(20) NOT NULL,
    eligibility_status VARCHAR(30) NOT NULL DEFAULT 'ELIGIBLE' CHECK (eligibility_status IN ('ELIGIBLE', 'NEEDS_REVIEW', 'INELIGIBLE')),
    eligibility_note TEXT,
    claimed_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    claimed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_student_rosters_term_student UNIQUE (term_id, student_code)
);

-- ====================================================================
-- 7. documents (Tai lieu & Minh chung)
-- ====================================================================
CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    context_type VARCHAR(40) NOT NULL, -- PROFILE, APPLICATION, AGREEMENT, PLACEMENT, TASK, LOGBOOK, EVALUATION, CASE
    context_id UUID NOT NULL,
    document_type VARCHAR(40) NOT NULL, -- CV, AGREEMENT, EVIDENCE, CERTIFICATE, REPORT, EXTERNAL_LINK
    storage_provider VARCHAR(30) NOT NULL DEFAULT 'LOCAL', -- LOCAL, GOOGLE_DRIVE
    provider_file_id VARCHAR(255) UNIQUE,
    provider_folder_id VARCHAR(255),
    external_url TEXT,
    original_name VARCHAR(255),
    mime_type VARCHAR(100),
    size_bytes BIGINT CHECK (size_bytes >= 0),
    checksum VARCHAR(128),
    visibility VARCHAR(30) NOT NULL DEFAULT 'PRIVATE' CHECK (visibility IN ('PRIVATE', 'PLACEMENT_PARTIES', 'FACULTY')),
    status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('UPLOADING', 'ACTIVE', 'FAILED', 'QUARANTINED', 'DELETED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- ====================================================================
-- 8. student_profiles (Ho so sinh vien)
-- ====================================================================
CREATE TABLE IF NOT EXISTS student_profiles (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    program_id UUID NOT NULL REFERENCES academic_programs(id) ON DELETE RESTRICT,
    student_code VARCHAR(50) NOT NULL UNIQUE,
    gpa NUMERIC(3,2) CHECK (gpa >= 0.0 AND gpa <= 4.0),
    current_cv_document_id UUID REFERENCES documents(id) ON DELETE SET NULL,
    certificates JSONB NOT NULL DEFAULT '[]'::jsonb,
    passed_courses JSONB NOT NULL DEFAULT '[]'::jsonb,
    preferences JSONB NOT NULL DEFAULT '{}'::jsonb,
    github_url VARCHAR(255),
    bio TEXT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    version INT NOT NULL DEFAULT 0
);

-- ====================================================================
-- 9. skill_taxonomies (Tu dien ky nang ESCO / NACE)
-- ====================================================================
CREATE TABLE IF NOT EXISTS skill_taxonomies (
    id VARCHAR(50) PRIMARY KEY, -- e.g. 'SK-SPRING-BOOT', 'SK-PYTHON'
    skill_name VARCHAR(150) NOT NULL,
    category VARCHAR(50) NOT NULL, -- TECHNICAL, SOFT_SKILL, NACE
    framework VARCHAR(50) NOT NULL DEFAULT 'ESCO',
    description TEXT,
    aliases JSONB NOT NULL DEFAULT '[]'::jsonb,
    taxonomy_version VARCHAR(50) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ====================================================================
-- 10. student_skills (Ky nang sinh vien)
-- ====================================================================
CREATE TABLE IF NOT EXISTS student_skills (
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    skill_id VARCHAR(50) NOT NULL REFERENCES skill_taxonomies(id) ON DELETE RESTRICT,
    source VARCHAR(30) NOT NULL CHECK (source IN ('CV_AI', 'STUDENT_DECLARED', 'COURSE', 'CERTIFICATE')),
    proficiency_level VARCHAR(30), -- BEGINNER, INTERMEDIATE, ADVANCED, EXPERT
    confidence NUMERIC(5,4) CHECK (confidence >= 0.0 AND confidence <= 1.0),
    is_confirmed BOOLEAN NOT NULL DEFAULT FALSE,
    evidence_document_id UUID REFERENCES documents(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (student_id, skill_id)
);

-- ====================================================================
-- 11. job_positions (Vi tri thuc tap)
-- ====================================================================
CREATE TABLE IF NOT EXISTS job_positions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    term_id UUID NOT NULL REFERENCES internship_terms(id) ON DELETE RESTRICT,
    department_id UUID NOT NULL REFERENCES departments(id) ON DELETE RESTRICT,
    title VARCHAR(255) NOT NULL,
    work_format VARCHAR(30) NOT NULL CHECK (work_format IN ('ONSITE', 'HYBRID', 'REMOTE')),
    location VARCHAR(255) NOT NULL,
    vacancies INT NOT NULL DEFAULT 1 CHECK (vacancies > 0),
    description TEXT NOT NULL,
    target_program_codes JSONB NOT NULL DEFAULT '[]'::jsonb,
    target_learning_outcomes JSONB NOT NULL DEFAULT '[]'::jsonb,
    benefits JSONB NOT NULL DEFAULT '[]'::jsonb,
    stipend_amount NUMERIC(12,2) CHECK (stipend_amount >= 0),
    status VARCHAR(30) NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'CLOSED')),
    faculty_feedback TEXT,
    approved_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    approved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    version INT NOT NULL DEFAULT 0
);

-- ====================================================================
-- 12. job_skills (Yeu cau ky nang cua vi tri)
-- ====================================================================
CREATE TABLE IF NOT EXISTS job_skills (
    job_id UUID NOT NULL REFERENCES job_positions(id) ON DELETE CASCADE,
    skill_id VARCHAR(50) NOT NULL REFERENCES skill_taxonomies(id) ON DELETE RESTRICT,
    requirement_type VARCHAR(20) NOT NULL CHECK (requirement_type IN ('MANDATORY', 'OPTIONAL')),
    required_level VARCHAR(30),
    weight NUMERIC(5,4) NOT NULL DEFAULT 1.0 CHECK (weight > 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (job_id, skill_id)
);

-- ====================================================================
-- 13. ai_runs (Lich su chay AI)
-- ====================================================================
CREATE TABLE IF NOT EXISTS ai_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    run_type VARCHAR(30) NOT NULL CHECK (run_type IN ('CV_EXTRACTION', 'JOB_EXTRACTION', 'EMBEDDING', 'MATCHING')),
    student_id UUID REFERENCES users(id) ON DELETE SET NULL,
    source_document_id UUID REFERENCES documents(id) ON DELETE SET NULL,
    job_id UUID REFERENCES job_positions(id) ON DELETE SET NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'RUNNING', 'COMPLETED', 'FAILED')),
    model_name VARCHAR(100) NOT NULL,
    model_version VARCHAR(100),
    taxonomy_version VARCHAR(50),
    input_hash VARCHAR(128) NOT NULL,
    input_snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
    output_result JSONB,
    error_detail JSONB,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ====================================================================
-- 14. job_applications (Ho so ung tuyen)
-- ====================================================================
CREATE TABLE IF NOT EXISTS job_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID NOT NULL REFERENCES job_positions(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    submitted_cv_document_id UUID NOT NULL REFERENCES documents(id) ON DELETE RESTRICT,
    matching_ai_run_id UUID REFERENCES ai_runs(id) ON DELETE SET NULL,
    cover_letter TEXT,
    ai_match_detail JSONB,
    interview_rounds JSONB NOT NULL DEFAULT '[]'::jsonb,
    status VARCHAR(30) NOT NULL DEFAULT 'SUBMITTED' CHECK (status IN ('SUBMITTED', 'REVIEWING', 'INTERVIEWING', 'OFFERED', 'REJECTED', 'WITHDRAWN')),
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    version INT NOT NULL DEFAULT 0,
    CONSTRAINT uq_job_applications_job_student UNIQUE (job_id, student_id)
);

-- ====================================================================
-- 15. placement_offers (De nghi tiep nhan)
-- ====================================================================
CREATE TABLE IF NOT EXISTS placement_offers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID NOT NULL UNIQUE REFERENCES job_applications(id) ON DELETE CASCADE,
    proposed_mentor_id UUID REFERENCES users(id) ON DELETE SET NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    stipend NUMERIC(12,2) CHECK (stipend >= 0),
    terms_snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
    expires_at TIMESTAMPTZ NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'SENT' CHECK (status IN ('SENT', 'ACCEPTED', 'DECLINED', 'EXPIRED', 'WITHDRAWN')),
    responded_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    version INT NOT NULL DEFAULT 0
);

-- ====================================================================
-- 16. learning_agreements (Thoa thuan hoc tap ba ben)
-- ====================================================================
CREATE TABLE IF NOT EXISTS learning_agreements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    offer_id UUID NOT NULL UNIQUE REFERENCES placement_offers(id) ON DELETE RESTRICT,
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE RESTRICT,
    department_id UUID NOT NULL REFERENCES departments(id) ON DELETE RESTRICT,
    target_credits INT NOT NULL CHECK (target_credits > 0),
    learning_objectives TEXT NOT NULL,
    status VARCHAR(40) NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'PENDING_SIGNATURES', 'APPROVED', 'REVISION_REQUESTED', 'CANCELLED')),
    student_signature JSONB,
    company_signature JSONB,
    faculty_signature JSONB,
    amendments JSONB NOT NULL DEFAULT '[]'::jsonb,
    document_id UUID REFERENCES documents(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    version INT NOT NULL DEFAULT 0
);

-- ====================================================================
-- 17. internship_placements (Lan thuc tap - Aggregate trung tam)
-- ====================================================================
CREATE TABLE IF NOT EXISTS internship_placements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agreement_id UUID NOT NULL UNIQUE REFERENCES learning_agreements(id) ON DELETE RESTRICT,
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE RESTRICT,
    mentor_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    lecturer_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    term_id UUID NOT NULL REFERENCES internship_terms(id) ON DELETE RESTRICT,
    work_schedule JSONB NOT NULL DEFAULT '{}'::jsonb,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_hours_worked NUMERIC(7,2) NOT NULL DEFAULT 0,
    status VARCHAR(30) NOT NULL DEFAULT 'PREPARING' CHECK (status IN ('PREPARING', 'ACTIVE', 'PAUSED', 'COMPLETED', 'TERMINATED', 'TRANSFERRED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    version INT NOT NULL DEFAULT 0
);

-- ====================================================================
-- 18. placement_tasks (Nhiem vu thuc tap)
-- ====================================================================
CREATE TABLE IF NOT EXISTS placement_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    placement_id UUID NOT NULL REFERENCES internship_placements(id) ON DELETE CASCADE,
    assigned_by_mentor_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    learning_outcomes JSONB NOT NULL DEFAULT '[]'::jsonb,
    due_at TIMESTAMPTZ,
    progress_percent INT NOT NULL DEFAULT 0 CHECK (progress_percent >= 0 AND progress_percent <= 100),
    status VARCHAR(30) NOT NULL DEFAULT 'ASSIGNED' CHECK (status IN ('ASSIGNED', 'IN_PROGRESS', 'SUBMITTED', 'REVISION_REQUIRED', 'COMPLETED', 'CANCELLED')),
    submission_summary TEXT,
    mentor_feedback TEXT,
    submitted_at TIMESTAMPTZ,
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    version INT NOT NULL DEFAULT 0
);

-- ====================================================================
-- 19. attendance_logs (Phien cham cong)
-- ====================================================================
CREATE TABLE IF NOT EXISTS attendance_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    placement_id UUID NOT NULL REFERENCES internship_placements(id) ON DELETE CASCADE,
    work_date DATE NOT NULL,
    check_in_at TIMESTAMPTZ NOT NULL,
    check_out_at TIMESTAMPTZ,
    duration_hours NUMERIC(5,2) CHECK (duration_hours >= 0),
    work_format VARCHAR(30) NOT NULL CHECK (work_format IN ('ONSITE', 'HYBRID', 'REMOTE')),
    check_in_location JSONB,
    check_out_location JSONB,
    status VARCHAR(30) NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'PENDING_CONFIRMATION', 'CONFIRMED', 'REJECTED', 'DISPUTED')),
    confirmed_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    confirmed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    version INT NOT NULL DEFAULT 0
);

-- ====================================================================
-- 20. weekly_logbooks (Nhat ky tuan)
-- ====================================================================
CREATE TABLE IF NOT EXISTS weekly_logbooks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    placement_id UUID NOT NULL REFERENCES internship_placements(id) ON DELETE CASCADE,
    week_number INT NOT NULL CHECK (week_number > 0),
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    tasks_completed TEXT NOT NULL,
    learning_reflection TEXT NOT NULL,
    total_hours NUMERIC(5,2) NOT NULL CHECK (total_hours >= 0),
    status VARCHAR(30) NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'SUBMITTED', 'APPROVED_BY_MENTOR', 'REVISION_REQUESTED')),
    mentor_feedback TEXT,
    mentor_reviewed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    mentor_reviewed_at TIMESTAMPTZ,
    lecturer_comment TEXT,
    lecturer_commented_by UUID REFERENCES users(id) ON DELETE SET NULL,
    lecturer_commented_at TIMESTAMPTZ,
    submitted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    version INT NOT NULL DEFAULT 0,
    CONSTRAINT uq_weekly_logbooks_placement_week UNIQUE (placement_id, week_number)
);

-- ====================================================================
-- 21. internship_cases (Ho so ngoai le)
-- ====================================================================
CREATE TABLE IF NOT EXISTS internship_cases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    placement_id UUID NOT NULL REFERENCES internship_placements(id) ON DELETE CASCADE,
    case_type VARCHAR(40) NOT NULL CHECK (case_type IN ('ATTENDANCE_CORRECTION', 'ATTENDANCE_DISPUTE', 'SCHEDULE_CHANGE', 'INCIDENT', 'TRANSFER_REQUEST', 'EARLY_TERMINATION', 'RESULT_APPEAL')),
    reported_by_user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    assigned_to_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    related_entity_type VARCHAR(40),
    related_entity_id UUID,
    severity VARCHAR(20) NOT NULL DEFAULT 'NORMAL' CHECK (severity IN ('LOW', 'NORMAL', 'HIGH', 'CRITICAL')),
    summary TEXT NOT NULL,
    detail JSONB NOT NULL DEFAULT '{}'::jsonb,
    resolution JSONB,
    status VARCHAR(30) NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'INVESTIGATING', 'WAITING_INFORMATION', 'RESOLVED', 'REJECTED')),
    opened_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    resolved_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    version INT NOT NULL DEFAULT 0
);

-- ====================================================================
-- 22. rubric_evaluations (Phieu danh gia Rubric NACE)
-- ====================================================================
CREATE TABLE IF NOT EXISTS rubric_evaluations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    placement_id UUID NOT NULL REFERENCES internship_placements(id) ON DELETE CASCADE,
    evaluator_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    evaluator_role VARCHAR(30) NOT NULL CHECK (evaluator_role IN ('COMPANY_MENTOR', 'LECTURER')),
    evaluation_stage VARCHAR(20) NOT NULL CHECK (evaluation_stage IN ('MIDTERM', 'FINAL')),
    rubric_version VARCHAR(50) NOT NULL,
    criteria_scores JSONB NOT NULL,
    final_score NUMERIC(5,2) NOT NULL CHECK (final_score >= 0.0 AND final_score <= 10.0),
    qualitative_feedback TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'SUBMITTED')),
    submitted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    version INT NOT NULL DEFAULT 0,
    CONSTRAINT uq_rubric_evaluations_placement_evaluator_stage UNIQUE (placement_id, evaluator_id, evaluation_stage)
);

-- ====================================================================
-- 23. final_results (Ket qua thuc tap cuoi cung)
-- ====================================================================
CREATE TABLE IF NOT EXISTS final_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    placement_id UUID NOT NULL UNIQUE REFERENCES internship_placements(id) ON DELETE CASCADE,
    mentor_score NUMERIC(5,2) CHECK (mentor_score >= 0.0 AND mentor_score <= 10.0),
    lecturer_score NUMERIC(5,2) CHECK (lecturer_score >= 0.0 AND lecturer_score <= 10.0),
    compliance_score NUMERIC(5,2) CHECK (compliance_score >= 0.0 AND compliance_score <= 10.0),
    component_breakdown JSONB NOT NULL DEFAULT '{}'::jsonb,
    final_score NUMERIC(5,2) CHECK (final_score >= 0.0 AND final_score <= 10.0),
    result_status VARCHAR(30) NOT NULL DEFAULT 'PENDING_REVIEW' CHECK (result_status IN ('PENDING_REVIEW', 'PASSED', 'FAILED', 'NOT_COMPLETED')),
    decided_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    published_at TIMESTAMPTZ,
    finalized_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    version INT NOT NULL DEFAULT 0
);

-- ====================================================================
-- 24. notifications (Thong bao nguoi dung)
-- ====================================================================
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipient_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    notification_type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    action_url TEXT,
    related_entity_type VARCHAR(40),
    related_entity_id UUID,
    delivery_channels JSONB NOT NULL DEFAULT '{"inApp": true}'::jsonb,
    delivery_status JSONB NOT NULL DEFAULT '{}'::jsonb,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ
);

-- ====================================================================
-- 25. state_history (Lich su chuyen trang thai)
-- ====================================================================
CREATE TABLE IF NOT EXISTS state_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type VARCHAR(40) NOT NULL,
    entity_id UUID NOT NULL,
    from_state VARCHAR(50),
    to_state VARCHAR(50) NOT NULL,
    action VARCHAR(80) NOT NULL,
    actor_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    reason TEXT,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ====================================================================
-- 26. audit_logs (Nhat ky kiem toan he thong)
-- ====================================================================
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(40),
    entity_id UUID,
    request_id VARCHAR(100),
    ip_address INET,
    user_agent TEXT,
    result VARCHAR(20) NOT NULL CHECK (result IN ('SUCCESS', 'FAILURE')),
    changed_fields JSONB,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ====================================================================
-- INDEXES CHO HIEU NANG
-- ====================================================================
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_department ON users(department_id);
CREATE INDEX IF NOT EXISTS idx_users_company ON users(company_id);

CREATE INDEX IF NOT EXISTS idx_student_rosters_term ON student_rosters(term_id);
CREATE INDEX IF NOT EXISTS idx_student_rosters_email ON student_rosters(official_email);

CREATE INDEX IF NOT EXISTS idx_job_positions_term ON job_positions(term_id);
CREATE INDEX IF NOT EXISTS idx_job_positions_status ON job_positions(status);
CREATE INDEX IF NOT EXISTS idx_job_positions_company ON job_positions(company_id);

CREATE INDEX IF NOT EXISTS idx_job_applications_job ON job_applications(job_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_student ON job_applications(student_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_status ON job_applications(status);

CREATE INDEX IF NOT EXISTS idx_placements_student ON internship_placements(student_id);
CREATE INDEX IF NOT EXISTS idx_placements_mentor ON internship_placements(mentor_id);
CREATE INDEX IF NOT EXISTS idx_placements_lecturer ON internship_placements(lecturer_id);
CREATE INDEX IF NOT EXISTS idx_placements_term ON internship_placements(term_id);
CREATE INDEX IF NOT EXISTS idx_placements_status ON internship_placements(status);

CREATE INDEX IF NOT EXISTS idx_tasks_placement ON placement_tasks(placement_id);
CREATE INDEX IF NOT EXISTS idx_attendance_placement_date ON attendance_logs(placement_id, work_date);
CREATE INDEX IF NOT EXISTS idx_logbooks_placement ON weekly_logbooks(placement_id);
CREATE INDEX IF NOT EXISTS idx_documents_context ON documents(context_type, context_id);
CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON notifications(recipient_user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_state_history_entity ON state_history(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor ON audit_logs(actor_user_id, created_at);
