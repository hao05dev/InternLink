-- ====================================================================
-- INTERNLINK DATABASE SCHEMA DDL
-- Tích hợp: pgvector, Chuẩn Erasmus+, ILO 208, QAA UK, NACE & ESCO
-- ====================================================================

-- 1. Kích hoạt Extension pgvector
CREATE EXTENSION IF NOT EXISTS vector;

-- ====================================================================
-- PHÂN HỆ 1: NGƯỜI DÙNG & PHÂN QUYỀN (RBAC)
-- ====================================================================
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    phone_number VARCHAR(20),
    role VARCHAR(30) NOT NULL, -- STUDENT, COMPANY_REP, COMPANY_MENTOR, FACULTY_ADMIN, LECTURER, ADMIN
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ====================================================================
-- PHÂN HỆ 2: DOANH NGHIỆP & THẨM ĐỊNH CHẤT LƯỢNG (QAA & ILO 208)
-- ====================================================================
CREATE TABLE IF NOT EXISTS companies (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    tax_code VARCHAR(50) UNIQUE,
    industry VARCHAR(100),
    website VARCHAR(255),
    address TEXT NOT NULL,
    description TEXT,
    work_environment_info TEXT, -- Điều kiện làm việc & an toàn theo ILO 208
    verification_status VARCHAR(30) DEFAULT 'PENDING', -- PENDING, VERIFIED, REJECTED, BLACKLISTED
    created_by_user_id BIGINT REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS company_verifications (
    id BIGSERIAL PRIMARY KEY,
    company_id BIGINT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    reviewed_by_faculty_id BIGINT NOT NULL REFERENCES users(id),
    status VARCHAR(30) NOT NULL, -- APPROVED, REJECTED, REQUEST_MORE_INFO
    review_notes TEXT,
    checklist_passed JSONB, -- Checklist an toàn lao động, tư cách pháp nhân (ILO/QAA)
    reviewed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ====================================================================
-- PHÂN HỆ 3: TỪ ĐIỂN KỸ NĂNG ESCO & VỊ TRÍ THỰC TẬP (PGVECTOR)
-- ====================================================================
CREATE TABLE IF NOT EXISTS skills (
    id VARCHAR(50) PRIMARY KEY, -- Ví dụ: 'SK-SPRING-BOOT', 'SK-DOCKER'
    name VARCHAR(100) UNIQUE NOT NULL,
    category VARCHAR(50) NOT NULL, -- Language, Backend, Frontend, Database, DevOps, SoftSkill
    esco_uri VARCHAR(255), -- Link định danh chuẩn ESCO châu Âu
    synonyms TEXT, -- Các từ đồng nghĩa, viết tắt phân tách bằng dấu phẩy
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS jobs (
    id BIGSERIAL PRIMARY KEY,
    company_id BIGINT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    target_major VARCHAR(100), -- Kỹ thuật phần mềm, Hệ thống thông tin...
    location VARCHAR(150),
    slots INT DEFAULT 1,
    stipend_range VARCHAR(100), -- Thù lao theo chuẩn ILO 208
    expected_learning_outcomes TEXT, -- Chuẩn đầu ra dự kiến của vị trí
    status VARCHAR(30) DEFAULT 'DRAFT', -- DRAFT, PENDING_APPROVAL, APPROVED, REJECTED, CLOSED
    faculty_feedback TEXT, -- Ý kiến phản hồi nếu Khoa yêu cầu sửa đổi
    version INT DEFAULT 1, -- Versioning mô tả vị trí
    embedding vector(768), -- Vector ngữ nghĩa 768 chiều (Gemini text-embedding-004)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_jobs_embedding ON jobs USING hnsw (embedding vector_cosine_ops);

CREATE TABLE IF NOT EXISTS job_skills (
    job_id BIGINT NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    skill_id VARCHAR(50) NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
    is_mandatory BOOLEAN DEFAULT TRUE, -- TRUE: Bắt buộc, FALSE: Ưu tiên/Cộng thêm
    PRIMARY KEY (job_id, skill_id)
);

-- ====================================================================
-- PHÂN HỆ 4: HỒ SƠ NĂNG LỰC SINH VIÊN & ỨNG TUYỂN
-- ====================================================================
CREATE TABLE IF NOT EXISTS student_profiles (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    student_code VARCHAR(30) UNIQUE NOT NULL, -- MSSV
    major VARCHAR(100) NOT NULL,
    gpa NUMERIC(3, 2), -- Điểm tích lũy thang 4.0
    cv_file_url TEXT,
    portfolio_url TEXT,
    bio_summary TEXT,
    preferred_location VARCHAR(100),
    embedding vector(768), -- Vector tóm tắt hồ sơ sinh viên
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_students_embedding ON student_profiles USING hnsw (embedding vector_cosine_ops);

CREATE TABLE IF NOT EXISTS student_skills (
    student_profile_id BIGINT NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
    skill_id VARCHAR(50) NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
    proficiency_level VARCHAR(20) DEFAULT 'BEGINNER', -- BEGINNER, INTERMEDIATE, ADVANCED
    verified_by_exam BOOLEAN DEFAULT FALSE,
    PRIMARY KEY (student_profile_id, skill_id)
);

CREATE TABLE IF NOT EXISTS applications (
    id BIGSERIAL PRIMARY KEY,
    student_profile_id BIGINT NOT NULL REFERENCES student_profiles(id),
    job_id BIGINT NOT NULL REFERENCES jobs(id),
    cover_letter TEXT,
    ai_match_score NUMERIC(5, 2), -- Lưu lại điểm AI gợi ý lúc nộp đơn
    status VARCHAR(30) DEFAULT 'APPLIED', -- APPLIED, SCREENING, INTERVIEW_SCHEDULED, OFFERED, ACCEPTED, REJECTED, WITHDRAWN
    interview_time TIMESTAMP WITH TIME ZONE,
    interview_location TEXT,
    interview_notes TEXT,
    offer_details TEXT,
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ====================================================================
-- PHÂN HỆ 5: THỎA THUẬN 3 BÊN CHUẨN ERASMUS+ (LEARNING AGREEMENT)
-- ====================================================================
CREATE TABLE IF NOT EXISTS learning_agreements (
    id BIGSERIAL PRIMARY KEY,
    application_id BIGINT UNIQUE NOT NULL REFERENCES applications(id),
    student_id BIGINT NOT NULL REFERENCES users(id),
    academic_supervisor_id BIGINT NOT NULL REFERENCES users(id),
    company_mentor_id BIGINT NOT NULL REFERENCES users(id),
    
    learning_objectives TEXT NOT NULL,
    detailed_tasks TEXT NOT NULL,
    work_hours_per_week INT DEFAULT 40,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    
    version INT DEFAULT 1,
    status VARCHAR(30) DEFAULT 'DRAFT', -- DRAFT, PENDING_SIGNATURES, ACTIVE, MODIFIED, COMPLETED, TERMINATED
    
    student_signed BOOLEAN DEFAULT FALSE,
    student_signed_at TIMESTAMP WITH TIME ZONE,
    
    mentor_signed BOOLEAN DEFAULT FALSE,
    mentor_signed_at TIMESTAMP WITH TIME ZONE,
    
    supervisor_signed BOOLEAN DEFAULT FALSE,
    supervisor_signed_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS agreement_amendments (
    id BIGSERIAL PRIMARY KEY,
    learning_agreement_id BIGINT NOT NULL REFERENCES learning_agreements(id) ON DELETE CASCADE,
    version_number INT NOT NULL,
    reason_for_change TEXT NOT NULL,
    changes_summary JSONB NOT NULL,
    approved_by_student BOOLEAN DEFAULT FALSE,
    approved_by_mentor BOOLEAN DEFAULT FALSE,
    approved_by_supervisor BOOLEAN DEFAULT FALSE,
    amended_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ====================================================================
-- PHÂN HỆ 6: NHẬT KÝ, QUẢN LÝ RỦI RO & ĐÁNH GIÁ RUBRIC (NACE & QAA)
-- ====================================================================
CREATE TABLE IF NOT EXISTS logbooks (
    id BIGSERIAL PRIMARY KEY,
    learning_agreement_id BIGINT NOT NULL REFERENCES learning_agreements(id) ON DELETE CASCADE,
    week_number INT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    tasks_performed TEXT NOT NULL,
    evidence_url TEXT,
    hours_logged NUMERIC(5, 1) DEFAULT 0,
    status VARCHAR(30) DEFAULT 'SUBMITTED', -- SUBMITTED, APPROVED_BY_MENTOR, REVISION_REQUESTED
    mentor_feedback TEXT,
    supervisor_notes TEXT,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS internship_incidents (
    id BIGSERIAL PRIMARY KEY,
    learning_agreement_id BIGINT NOT NULL REFERENCES learning_agreements(id),
    reported_by_user_id BIGINT NOT NULL REFERENCES users(id),
    incident_type VARCHAR(50) NOT NULL, -- ABSENCE, TASK_MISMATCH, WORKPLACE_SAFETY, HARASSMENT, EARLY_TERMINATION
    description TEXT NOT NULL,
    severity VARCHAR(20) DEFAULT 'MEDIUM', -- LOW, MEDIUM, HIGH, CRITICAL
    resolution_status VARCHAR(30) DEFAULT 'OPEN', -- OPEN, INVESTIGATING, RESOLVED, ESCALATED
    resolution_notes TEXT,
    reported_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS nace_competencies (
    code VARCHAR(30) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT
);

CREATE TABLE IF NOT EXISTS rubric_evaluations (
    id BIGSERIAL PRIMARY KEY,
    learning_agreement_id BIGINT NOT NULL REFERENCES learning_agreements(id),
    evaluation_type VARCHAR(20) NOT NULL, -- MIDTERM, FINAL
    evaluator_role VARCHAR(30) NOT NULL, -- COMPANY_MENTOR, ACADEMIC_SUPERVISOR, STUDENT_SELF
    evaluator_user_id BIGINT NOT NULL REFERENCES users(id),
    total_score NUMERIC(4, 2),
    qualitative_comments TEXT,
    strengths_observed TEXT,
    areas_for_improvement TEXT,
    evaluated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS rubric_criteria_scores (
    id BIGSERIAL PRIMARY KEY,
    evaluation_id BIGINT NOT NULL REFERENCES rubric_evaluations(id) ON DELETE CASCADE,
    competency_code VARCHAR(30) NOT NULL REFERENCES nace_competencies(code),
    score NUMERIC(3, 1) NOT NULL,
    behavioral_evidence TEXT,
    UNIQUE (evaluation_id, competency_code)
);