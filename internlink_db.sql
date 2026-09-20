-- ====================================================================================================
-- CTU INTERNLINK DATABASE SCHEMA & SEED DATA DDL (LEAN 26 TABLES)
-- Đề tài: Nền tảng quản lý toàn trình thực tập và đối sánh năng lực sinh viên - doanh nghiệp tích hợp AI
-- Đơn vị: Trường Công nghệ Thông tin & Truyền thông - Đại học Cần Thơ (CICT - CTU)
-- Tiêu chuẩn: Erasmus+, ILO 208, QAA UK, NACE Competencies & ESCO Taxonomy
-- Hệ quản trị CSDL: PostgreSQL 16+ (Hỗ trợ extension vector & pgcrypto)
-- Mục đích: File chạy trực tiếp trên pgAdmin / psql
-- ====================================================================================================

-- 0. CẤU HÌNH ENCODING & EXTENSION
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET client_min_messages = warning;

CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ====================================================================================================
-- XÓA BẢNG CŨ (Thứ tự đảo ngược khóa ngoại để chạy lại an toàn nhiều lần trên pgAdmin)
-- ====================================================================================================
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS state_history CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS final_results CASCADE;
DROP TABLE IF EXISTS rubric_evaluations CASCADE;
DROP TABLE IF EXISTS internship_cases CASCADE;
DROP TABLE IF EXISTS weekly_logbooks CASCADE;
DROP TABLE IF EXISTS attendance_logs CASCADE;
DROP TABLE IF EXISTS placement_tasks CASCADE;
DROP TABLE IF EXISTS internship_placements CASCADE;
DROP TABLE IF EXISTS learning_agreements CASCADE;
DROP TABLE IF EXISTS placement_offers CASCADE;
DROP TABLE IF EXISTS job_applications CASCADE;
DROP TABLE IF EXISTS ai_runs CASCADE;
DROP TABLE IF EXISTS job_skills CASCADE;
DROP TABLE IF EXISTS job_positions CASCADE;
DROP TABLE IF EXISTS student_skills CASCADE;
DROP TABLE IF EXISTS skill_taxonomies CASCADE;
DROP TABLE IF EXISTS student_profiles CASCADE;
DROP TABLE IF EXISTS documents CASCADE;
DROP TABLE IF EXISTS student_rosters CASCADE;
DROP TABLE IF EXISTS internship_terms CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS companies CASCADE;
DROP TABLE IF EXISTS academic_programs CASCADE;
DROP TABLE IF EXISTS departments CASCADE;

-- ====================================================================================================
-- PHÂN HỆ 1: TỔ CHỨC & DANH TÍNH (3 BẢNG)
-- ====================================================================================================

-- 1. departments (Khoa / Đơn vị đào tạo)
CREATE TABLE departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(200) NOT NULL,
    contact_email VARCHAR(150) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. academic_programs (Ngành / Chương trình đào tạo)
CREATE TABLE academic_programs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    department_id UUID NOT NULL REFERENCES departments(id) ON DELETE RESTRICT,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(200) NOT NULL,
    degree_level VARCHAR(30) NOT NULL DEFAULT 'UNDERGRADUATE',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. companies (Hồ sơ Doanh nghiệp)
CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_name VARCHAR(255) NOT NULL,
    tax_code VARCHAR(50) NOT NULL UNIQUE,
    industry VARCHAR(100),
    website VARCHAR(255),
    address JSONB NOT NULL,
    verification_status VARCHAR(30) NOT NULL DEFAULT 'PENDING' CHECK (verification_status IN ('PENDING', 'NEEDS_REVISION', 'VERIFIED', 'REJECTED')),
    verification_detail JSONB NOT NULL DEFAULT '{}'::jsonb,
    verified_by_user_id UUID,
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    version INT NOT NULL DEFAULT 0
);

-- 4. users (Tài khoản người dùng - 6 Roles)
CREATE TABLE users (
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

-- Khóa ngoại từ companies đến users cho người thẩm định
ALTER TABLE companies
    ADD CONSTRAINT fk_companies_verified_by
    FOREIGN KEY (verified_by_user_id) REFERENCES users(id) ON DELETE SET NULL;

-- ====================================================================================================
-- PHÂN HỆ 2: KỲ THỰC TẬP & SINH VIÊN (3 BẢNG)
-- ====================================================================================================

-- 5. internship_terms (Kỳ thực tập)
CREATE TABLE internship_terms (
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

-- 6. student_rosters (Danh sách sinh viên đủ điều kiện)
CREATE TABLE student_rosters (
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

-- 7. documents (Tài liệu, CV & Minh chứng)
CREATE TABLE documents (
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

-- 8. student_profiles (Hồ sơ năng lực sinh viên)
CREATE TABLE student_profiles (
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

-- ====================================================================================================
-- PHÂN HỆ 3: KỸ NĂNG & AI MATCHING (4 BẢNG)
-- ====================================================================================================

-- 9. skill_taxonomies (Từ điển kỹ năng chuẩn ESCO / NACE)
CREATE TABLE skill_taxonomies (
    id VARCHAR(50) PRIMARY KEY, -- Ví dụ: 'SK-SPRING-BOOT', 'SK-PYTHON'
    skill_name VARCHAR(150) NOT NULL,
    category VARCHAR(50) NOT NULL, -- TECHNICAL, SOFT_SKILL, NACE
    framework VARCHAR(50) NOT NULL DEFAULT 'ESCO',
    description TEXT,
    aliases JSONB NOT NULL DEFAULT '[]'::jsonb,
    taxonomy_version VARCHAR(50) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. student_skills (Kỹ năng đã xác nhận của sinh viên)
CREATE TABLE student_skills (
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

-- 11. job_positions (Vị trí thực tập do Doanh nghiệp đăng)
CREATE TABLE job_positions (
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

-- 12. job_skills (Yêu cầu kỹ năng của vị trí)
CREATE TABLE job_skills (
    job_id UUID NOT NULL REFERENCES job_positions(id) ON DELETE CASCADE,
    skill_id VARCHAR(50) NOT NULL REFERENCES skill_taxonomies(id) ON DELETE RESTRICT,
    requirement_type VARCHAR(20) NOT NULL CHECK (requirement_type IN ('MANDATORY', 'OPTIONAL')),
    required_level VARCHAR(30),
    weight NUMERIC(5,4) NOT NULL DEFAULT 1.0 CHECK (weight > 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (job_id, skill_id)
);

-- 13. ai_runs (Lịch sử chạy AI - Trích xuất & Đối sánh)
CREATE TABLE ai_runs (
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

-- ====================================================================================================
-- PHÂN HỆ 4: TUYỂN DỤNG & ĐỀ NGHỊ TIẾP NHẬN (2 BẢNG)
-- ====================================================================================================

-- 14. job_applications (Hồ sơ ứng tuyển)
CREATE TABLE job_applications (
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

-- 15. placement_offers (Đề nghị tiếp nhận thực tập)
CREATE TABLE placement_offers (
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

-- ====================================================================================================
-- PHÂN HỆ 5: THỎA THUẬN & VẬN HÀNH THỰC TẬP (5 BẢNG)
-- ====================================================================================================

-- 16. learning_agreements (Thỏa thuận học tập ba bên - Erasmus+ Model)
CREATE TABLE learning_agreements (
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

-- 17. internship_placements (Lần thực tập - Aggregate trung tâm)
CREATE TABLE internship_placements (
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

-- 18. placement_tasks (Nhiệm vụ thực tập - Mentor giao)
CREATE TABLE placement_tasks (
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

-- 19. attendance_logs (Phiên chấm công hàng ngày)
CREATE TABLE attendance_logs (
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

-- 20. weekly_logbooks (Nhật ký tuần - Nhận xét 2 lớp)
CREATE TABLE weekly_logbooks (
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

-- ====================================================================================================
-- PHÂN HỆ 6: NGOẠI LỆ, ĐÁNH GIÁ & KẾT QUẢ (3 BẢNG)
-- ====================================================================================================

-- 21. internship_cases (Hồ sơ xử lý ngoại lệ tập trung)
CREATE TABLE internship_cases (
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

-- 22. rubric_evaluations (Phiếu đánh giá Rubric NACE - 8 Tiêu chí)
CREATE TABLE rubric_evaluations (
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

-- 23. final_results (Kết quả thực tập chính thức do Khoa công bố)
CREATE TABLE final_results (
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

-- ====================================================================================================
-- PHÂN HỆ 7: HỖ TRỢ, LỊCH SỬ & AUDIT (3 BẢNG)
-- ====================================================================================================

-- 24. notifications (Thông báo người dùng)
CREATE TABLE notifications (
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

-- 25. state_history (Lịch sử chuyển trạng thái nghiệp vụ - Append Only)
CREATE TABLE state_history (
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

-- 26. audit_logs (Nhật ký kiểm toán hệ thống - Append Only)
CREATE TABLE audit_logs (
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

-- ====================================================================================================
-- TẠO INDEXES TỐI ƯU TRUY VẤN
-- ====================================================================================================
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_department ON users(department_id);
CREATE INDEX idx_users_company ON users(company_id);

CREATE INDEX idx_student_rosters_term ON student_rosters(term_id);
CREATE INDEX idx_student_rosters_email ON student_rosters(official_email);

CREATE INDEX idx_job_positions_term ON job_positions(term_id);
CREATE INDEX idx_job_positions_status ON job_positions(status);
CREATE INDEX idx_job_positions_company ON job_positions(company_id);

CREATE INDEX idx_job_applications_job ON job_applications(job_id);
CREATE INDEX idx_job_applications_student ON job_applications(student_id);
CREATE INDEX idx_job_applications_status ON job_applications(status);

CREATE INDEX idx_placements_student ON internship_placements(student_id);
CREATE INDEX idx_placements_mentor ON internship_placements(mentor_id);
CREATE INDEX idx_placements_lecturer ON internship_placements(lecturer_id);
CREATE INDEX idx_placements_term ON internship_placements(term_id);
CREATE INDEX idx_placements_status ON internship_placements(status);

CREATE INDEX idx_tasks_placement ON placement_tasks(placement_id);
CREATE INDEX idx_attendance_placement_date ON attendance_logs(placement_id, work_date);
CREATE INDEX idx_logbooks_placement ON weekly_logbooks(placement_id);
CREATE INDEX idx_documents_context ON documents(context_type, context_id);
CREATE INDEX idx_notifications_recipient ON notifications(recipient_user_id, is_read);
CREATE INDEX idx_state_history_entity ON state_history(entity_type, entity_id);
CREATE INDEX idx_audit_logs_actor ON audit_logs(actor_user_id, created_at);

-- ====================================================================================================
-- SEED DỮ LIỆU MẪU BAN ĐẦU (DEMO SẴN CHO 6 ACTOR & KỊCH BẢN DEMO 15 BƯỚC)
-- Mật khẩu chung cho tất cả tài khoản: "Password@123"
-- BCrypt Hash: $2a$10$V04qPky6yVn5nff2zFkWveXlJ/z46L.G9v72xT74z7rK9n0W1WzK6
-- ====================================================================================================

-- 1. Khoa CNTT-TT
INSERT INTO departments (id, code, name, contact_email, is_active)
VALUES ('11111111-1111-1111-1111-111111111111', 'CICT', 'Trường Công nghệ Thông tin và Truyền thông - ĐH Cần Thơ', 'cict@ctu.edu.vn', TRUE);

-- 2. Ngành Kỹ thuật Phần mềm
INSERT INTO academic_programs (id, department_id, code, name, degree_level, is_active)
VALUES ('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'SE', 'Kỹ thuật phần mềm', 'UNDERGRADUATE', TRUE);

-- 3. Doanh nghiệp FPT Software Cần Thơ
INSERT INTO companies (id, company_name, tax_code, industry, website, address, verification_status, verification_detail)
VALUES (
    '33333333-3333-3333-3333-333333333333',
    'FPT Software Cần Thơ',
    '0101234567',
    'Công nghệ thông tin & Phần mềm',
    'https://fptsoftware.com',
    '{"street": "Đường số 1, KDC Nam Long", "ward": "Hưng Thạnh", "district": "Cái Răng", "province": "Cần Thơ"}'::jsonb,
    'VERIFIED',
    '{"safetyCheckPassed": true, "legalChecked": true}'::jsonb
);

-- 4. 6 Tài khoản người dùng mẫu
INSERT INTO users (id, department_id, company_id, email, password_hash, full_name, phone_number, role, must_change_password, is_active)
VALUES 
    -- 1. Admin
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', NULL, 'admin@ctu.edu.vn', '$2a$10$V04qPky6yVn5nff2zFkWveXlJ/z46L.G9v72xT74z7rK9n0W1WzK6', 'Quản trị viên Hệ thống', '0901000001', 'ADMIN', FALSE, TRUE),
    -- 2. Cán bộ Khoa (Faculty Admin)
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '11111111-1111-1111-1111-111111111111', NULL, 'faculty@ctu.edu.vn', '$2a$10$V04qPky6yVn5nff2zFkWveXlJ/z46L.G9v72xT74z7rK9n0W1WzK6', 'Cán bộ Quản lý Thực tập', '0901000002', 'FACULTY_ADMIN', FALSE, TRUE),
    -- 3. Giảng viên hướng dẫn (Lecturer)
    ('cccccccc-cccc-cccc-cccc-cccccccccccc', '11111111-1111-1111-1111-111111111111', NULL, 'lecturer@ctu.edu.vn', '$2a$10$V04qPky6yVn5nff2zFkWveXlJ/z46L.G9v72xT74z7rK9n0W1WzK6', 'TS. Nguyễn Văn Hướng Dẫn', '0901000003', 'LECTURER', FALSE, TRUE),
    -- 4. Sinh viên (Student)
    ('dddddddd-dddd-dddd-dddd-dddddddddddd', '11111111-1111-1111-1111-111111111111', NULL, 'student@ctu.edu.vn', '$2a$10$V04qPky6yVn5nff2zFkWveXlJ/z46L.G9v72xT74z7rK9n0W1WzK6', 'Nguyễn Văn Sinh Viên', '0901000004', 'STUDENT', FALSE, TRUE),
    -- 5. Đại diện Doanh nghiệp (Company Rep)
    ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', NULL, '33333333-3333-3333-3333-333333333333', 'recruiter@fpt.com', '$2a$10$V04qPky6yVn5nff2zFkWveXlJ/z46L.G9v72xT74z7rK9n0W1WzK6', 'Trần Thị Tuyển Dụng', '0901000005', 'COMPANY_REP', FALSE, TRUE),
    -- 6. Mentor Doanh nghiệp (Company Mentor)
    ('ffffffff-ffff-ffff-ffff-ffffffffffff', NULL, '33333333-3333-3333-3333-333333333333', 'mentor@fpt.com', '$2a$10$V04qPky6yVn5nff2zFkWveXlJ/z46L.G9v72xT74z7rK9n0W1WzK6', 'Lê Văn Mentor', '0901000006', 'COMPANY_MENTOR', FALSE, TRUE);

-- Cập nhật người thẩm định doanh nghiệp
UPDATE companies SET verified_by_user_id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', verified_at = NOW() WHERE id = '33333333-3333-3333-3333-333333333333';

-- 5. Kỳ thực tập HK1 2026-2027
INSERT INTO internship_terms (id, department_id, code, term_name, academic_year, semester, registration_open_at, registration_close_at, start_date, end_date, application_deadline, evaluation_deadline, status, settings)
VALUES (
    '55555555-5555-5555-5555-555555555555',
    '11111111-1111-1111-1111-111111111111',
    'HK1_2026_2027',
    'Học kỳ 1 Năm học 2026-2027',
    '2026-2027',
    'HK1',
    NOW() - INTERVAL '30 days',
    NOW() + INTERVAL '10 days',
    CURRENT_DATE + INTERVAL '15 days',
    CURRENT_DATE + INTERVAL '105 days',
    NOW() + INTERVAL '10 days',
    CURRENT_DATE + INTERVAL '115 days',
    'APPLICATION_OPEN',
    '{"requiredHours": 320, "weeklyLogFrequency": "WEEKLY", "appealWindowDays": 7, "mentorWeight": 0.6, "lecturerWeight": 0.4}'::jsonb
);

-- 6. Danh sách sinh viên đủ điều kiện (Roster)
INSERT INTO student_rosters (id, term_id, program_id, student_code, official_email, full_name, academic_year, eligibility_status, claimed_user_id, claimed_at)
VALUES (
    '66666666-6666-6666-6666-666666666666',
    '55555555-5555-5555-5555-555555555555',
    '22222222-2222-2222-2222-222222222222',
    'B2001234',
    'student@ctu.edu.vn',
    'Nguyễn Văn Sinh Viên',
    'Khóa 46',
    'ELIGIBLE',
    'dddddddd-dddd-dddd-dddd-dddddddddddd',
    NOW()
);

-- 7. Hồ sơ sinh viên mẫu
INSERT INTO student_profiles (user_id, program_id, student_code, gpa, bio, preferences, certificates, passed_courses)
VALUES (
    'dddddddd-dddd-dddd-dddd-dddddddddddd',
    '22222222-2222-2222-2222-222222222222',
    'B2001234',
    3.45,
    'Sinh viên năm 4 chuyên ngành Kỹ thuật phần mềm. Đam mê lập trình Backend, RESTful API và Cloud Native.',
    '{"locations": ["Cần Thơ", "TP. Hồ Chí Minh"], "workFormats": ["ONSITE", "HYBRID"]}'::jsonb,
    '[{"name": "AWS Certified Cloud Practitioner", "year": 2025}]'::jsonb,
    '[{"courseCode": "CT176", "courseName": "Lập trình hướng đối tượng", "grade": 3.7}, {"courseCode": "CT240", "courseName": "Cơ sở dữ liệu", "grade": 3.5}]'::jsonb
);

-- 8. Từ điển kỹ năng chuẩn ESCO & NACE
INSERT INTO skill_taxonomies (id, skill_name, category, framework, aliases, taxonomy_version, description)
VALUES 
    -- Technical - Backend & Languages
    ('SK-JAVA', 'Java', 'TECHNICAL', 'ESCO', '["Java 17", "Java 21", "Core Java"]'::jsonb, 'v1.0', 'Ngôn ngữ lập trình Java hướng đối tượng'),
    ('SK-SPRING-BOOT', 'Spring Boot', 'TECHNICAL', 'ESCO', '["Spring Boot 3", "Spring Framework", "Spring Data", "Spring Security"]'::jsonb, 'v1.0', 'Framework phát triển backend Java'),
    ('SK-PYTHON', 'Python', 'TECHNICAL', 'ESCO', '["Python 3", "Pythonic"]'::jsonb, 'v1.0', 'Ngôn ngữ lập trình Python'),
    ('SK-FASTAPI', 'FastAPI', 'TECHNICAL', 'ESCO', '["FastAPI Python", "Starlette"]'::jsonb, 'v1.0', 'Web framework Python hiệu năng cao'),
    ('SK-POSTGRESQL', 'PostgreSQL', 'TECHNICAL', 'ESCO', '["Postgres", "pgvector", "Relational Database"]'::jsonb, 'v1.0', 'Hệ quản trị cơ sở dữ liệu quan hệ mã nguồn mở'),
    ('SK-DOCKER', 'Docker', 'TECHNICAL', 'ESCO', '["Container", "Docker Compose"]'::jsonb, 'v1.0', 'Công nghệ đóng gói container ứng dụng'),
    ('SK-REST-API', 'RESTful API', 'TECHNICAL', 'ESCO', '["REST API", "JSON API", "Web Services"]'::jsonb, 'v1.0', 'Thiết kế và xây dựng API theo kiến trúc REST'),
    ('SK-REACT', 'React', 'TECHNICAL', 'ESCO', '["React.js", "Next.js", "React Hooks"]'::jsonb, 'v1.0', 'Thư viện JavaScript xây dựng giao diện người dùng'),
    ('SK-GIT', 'Git', 'TECHNICAL', 'ESCO', '["Git Version Control", "GitHub", "GitLab"]'::jsonb, 'v1.0', 'Hệ thống quản lý phiên bản mã nguồn phân tán'),
    -- Soft Skills - Khung năng lực NACE
    ('SK-CRITICAL-THINKING', 'Critical Thinking', 'SOFT_SKILL', 'NACE', '["Tư duy phản biện", "Giải quyết vấn đề", "Problem Solving"]'::jsonb, 'v1.0', 'Khả năng phân tích, đánh giá vấn đề logic'),
    ('SK-COMMUNICATION', 'Communication', 'SOFT_SKILL', 'NACE', '["Giao tiếp", "Trình bày", "Team Communication"]'::jsonb, 'v1.0', 'Khả năng truyền đạt thông tin rõ ràng, hiệu quả'),
    ('SK-TEAMWORK', 'Teamwork', 'SOFT_SKILL', 'NACE', '["Làm việc nhóm", "Collaboration", "Hợp tác"]'::jsonb, 'v1.0', 'Khả năng phối hợp nhịp nhàng trong tập thể'),
    ('SK-PROFESSIONALISM', 'Professionalism & Work Ethic', 'SOFT_SKILL', 'NACE', '["Đạo đức nghề nghiệp", "Trách nhiệm", "Kỷ luật"]'::jsonb, 'v1.0', 'Tác phong chuyên nghiệp, đúng giờ, tuân thủ kỷ luật');

-- 9. Kỹ năng đã có của sinh viên mẫu
INSERT INTO student_skills (student_id, skill_id, source, proficiency_level, confidence, is_confirmed)
VALUES
    ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'SK-JAVA', 'STUDENT_DECLARED', 'INTERMEDIATE', 0.90, TRUE),
    ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'SK-SPRING-BOOT', 'STUDENT_DECLARED', 'INTERMEDIATE', 0.85, TRUE),
    ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'SK-POSTGRESQL', 'STUDENT_DECLARED', 'INTERMEDIATE', 0.80, TRUE),
    ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'SK-GIT', 'STUDENT_DECLARED', 'INTERMEDIATE', 0.95, TRUE),
    ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'SK-TEAMWORK', 'STUDENT_DECLARED', 'INTERMEDIATE', 0.90, TRUE);

-- 10. Vị trí tuyển dụng mẫu đã được phê duyệt
INSERT INTO job_positions (
    id, company_id, term_id, department_id, title, work_format, location, vacancies, description,
    target_program_codes, target_learning_outcomes, benefits, stipend_amount, status, approved_by_user_id, approved_at
)
VALUES (
    '77777777-7777-7777-7777-777777777777',
    '33333333-3333-3333-3333-333333333333',
    '55555555-5555-5555-5555-555555555555',
    '11111111-1111-1111-1111-111111111111',
    'Thực tập sinh Java Backend Developer',
    'HYBRID',
    'Tòa nhà FPT Cần Thơ, Đường số 1, KDC Nam Long, Cái Răng, Cần Thơ',
    3,
    'Tham gia phát triển các module dịch vụ backend trên nền tảng Java 21, Spring Boot 3 và PostgreSQL. Viết REST API, Unit Test và phối hợp làm việc theo mô hình Agile/Scrum.',
    '["SE", "CS", "IT"]'::jsonb,
    '["Nắm vững kiến trúc Microservices & Spring Boot", "Kỹ năng làm việc nhóm và giao tiếp dự án"]'::jsonb,
    '["Hỗ trợ phụ cấp hàng tháng", "Cơ hội trở thành nhân viên chính thức sau thực tập", "Được cấp laptop làm việc"]'::jsonb,
    5000000.00,
    'APPROVED',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    NOW()
);

-- 11. Yêu cầu kỹ năng của vị trí tuyển dụng mẫu
INSERT INTO job_skills (job_id, skill_id, requirement_type, required_level, weight)
VALUES
    ('77777777-7777-7777-7777-777777777777', 'SK-JAVA', 'MANDATORY', 'INTERMEDIATE', 1.0),
    ('77777777-7777-7777-7777-777777777777', 'SK-SPRING-BOOT', 'MANDATORY', 'INTERMEDIATE', 1.0),
    ('77777777-7777-7777-7777-777777777777', 'SK-POSTGRESQL', 'OPTIONAL', 'BEGINNER', 0.8),
    ('77777777-7777-7777-7777-777777777777', 'SK-GIT', 'MANDATORY', 'INTERMEDIATE', 0.7),
    ('77777777-7777-7777-7777-777777777777', 'SK-TEAMWORK', 'MANDATORY', 'INTERMEDIATE', 0.6);

-- ====================================================================================================
-- HOÀN TẤT KHỞI TẠO CSDL
-- ====================================================================================================
