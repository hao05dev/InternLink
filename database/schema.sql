-- ====================================================================================================
-- INTERNLINK DATABASE SCHEMA & SEED DATA DDL
-- Project: InternLink - Nen tang Quan ly Toan trinh Thuc tap & Doi sanh Nang luc Tich hop AI
-- Standard Compliance: Erasmus+ (BP9.1), ILO 208 (BP9.2), QAA UK (BP9.3), NACE (BP9.4) & ESCO Taxonomy
-- Target DBMS: PostgreSQL 16+ with pgvector extension
-- ====================================================================================================

-- 0. CAU HINH CLIENT ENCODING VA EXTENSION
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET client_min_messages = warning;

CREATE EXTENSION IF NOT EXISTS vector;

-- ====================================================================================================
-- DROP TABLES (Thu tu dao nguoc khoa ngoai de chay lai an toan nhieu lan tren pgAdmin / psql)
-- ====================================================================================================
DROP TABLE IF EXISTS satisfaction_surveys CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS internship_appeals CASCADE;
DROP TABLE IF EXISTS rubric_criteria_scores CASCADE;
DROP TABLE IF EXISTS rubric_evaluations CASCADE;
DROP TABLE IF EXISTS nace_competencies CASCADE;
DROP TABLE IF EXISTS internship_incidents CASCADE;
DROP TABLE IF EXISTS logbooks CASCADE;
DROP TABLE IF EXISTS agreement_amendments CASCADE;
DROP TABLE IF EXISTS learning_agreements CASCADE;
DROP TABLE IF EXISTS interview_participants CASCADE;
DROP TABLE IF EXISTS interviews CASCADE;
DROP TABLE IF EXISTS matching_results CASCADE;
DROP TABLE IF EXISTS applications CASCADE;
DROP TABLE IF EXISTS assignment_histories CASCADE;
DROP TABLE IF EXISTS supervisor_assignments CASCADE;
DROP TABLE IF EXISTS term_student_registrations CASCADE;
DROP TABLE IF EXISTS internship_terms CASCADE;
DROP TABLE IF EXISTS student_certificates CASCADE;
DROP TABLE IF EXISTS student_courses CASCADE;
DROP TABLE IF EXISTS logbooks CASCADE;
DROP TABLE IF EXISTS agreement_amendments CASCADE;
DROP TABLE IF EXISTS learning_agreements CASCADE;
DROP TABLE IF EXISTS interview_participants CASCADE;
DROP TABLE IF EXISTS interviews CASCADE;
DROP TABLE IF EXISTS matching_results CASCADE;
DROP TABLE IF EXISTS applications CASCADE;
DROP TABLE IF EXISTS student_skills CASCADE;
DROP TABLE IF EXISTS student_profiles CASCADE;
DROP TABLE IF EXISTS job_skills CASCADE;
DROP TABLE IF EXISTS jobs CASCADE;
DROP TABLE IF EXISTS skills CASCADE;
DROP TABLE IF EXISTS company_verifications CASCADE;
DROP TABLE IF EXISTS companies CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS departments CASCADE;
DROP TABLE IF EXISTS universities CASCADE;
DROP TABLE IF EXISTS addresses CASCADE;
DROP TABLE IF EXISTS wards CASCADE;
DROP TABLE IF EXISTS districts CASCADE;
DROP TABLE IF EXISTS provinces CASCADE;

-- ====================================================================================================
-- PHAN HE 1: DIA GIOI HANH CHINH & DIA CHI (PROVINCES - DISTRICTS - WARDS - ADDRESSES)
-- ====================================================================================================

-- 1.1 Tinh / Thanh pho
CREATE TABLE provinces (
    id BIGSERIAL PRIMARY KEY,
    province_name VARCHAR(200) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 1.2 Quan / Huyen / Thi xa
CREATE TABLE districts (
    id BIGSERIAL PRIMARY KEY,
    province_id BIGINT NOT NULL REFERENCES provinces(id) ON DELETE CASCADE,
    district_name VARCHAR(200) NOT NULL,
    code VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 1.3 Phuong / Xa / Thi tran
CREATE TABLE wards (
    id BIGSERIAL PRIMARY KEY,
    district_id BIGINT NOT NULL REFERENCES districts(id) ON DELETE CASCADE,
    ward_name VARCHAR(200) NOT NULL,
    code VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 1.4 Dia chi chi tiet
CREATE TABLE addresses (
    id BIGSERIAL PRIMARY KEY,
    ward_id BIGINT REFERENCES wards(id) ON DELETE SET NULL,
    address_line VARCHAR(255) NOT NULL,
    region_type VARCHAR(30) DEFAULT 'HEADQUARTERS',
    postal_code VARCHAR(20),
    latitude NUMERIC(10, 7),
    longitude NUMERIC(10, 7),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ====================================================================================================
-- PHAN HE 2: CO CAU TRUONG DAI HOC & KHOA/BO MON (UNIVERSITIES - DEPARTMENTS)
-- ====================================================================================================

-- 2.1 Truong dai hoc
CREATE TABLE universities (
    id BIGSERIAL PRIMARY KEY,
    university_name VARCHAR(500) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    website VARCHAR(255),
    address_id BIGINT REFERENCES addresses(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 2.2 Khoa / Bo mon / Phong Quan ly Thuc tap
CREATE TABLE departments (
    id BIGSERIAL PRIMARY KEY,
    university_id BIGINT NOT NULL REFERENCES universities(id) ON DELETE CASCADE,
    department_name VARCHAR(150) NOT NULL,
    department_type VARCHAR(50) NOT NULL DEFAULT 'FACULTY',
    description TEXT,
    status VARCHAR(30) DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ====================================================================================================
-- PHAN HE 3: NGUOI DUNG & PHAN QUYEN RBAC (USERS - 6 ROLES)
-- ====================================================================================================

-- 3.1 Nguoi dung he thong
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    phone_number VARCHAR(20),
    role VARCHAR(30) NOT NULL,
    department_id BIGINT REFERENCES departments(id) ON DELETE SET NULL,
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ====================================================================================================
-- PHAN HE 4: DOANH NGHIEP & THAM DINH CHAT LUONG (COMPANIES - ILO 208 & QAA)
-- ====================================================================================================

-- 4.1 Doanh nghiep
CREATE TABLE companies (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    tax_code VARCHAR(50) UNIQUE,
    industry VARCHAR(100),
    website VARCHAR(255),
    address_id BIGINT REFERENCES addresses(id) ON DELETE SET NULL,
    address_raw TEXT,
    contact_name VARCHAR(150),
    contact_email VARCHAR(150),
    contact_phone VARCHAR(20),
    description TEXT,
    work_environment_info TEXT,
    mou_status VARCHAR(30) DEFAULT 'NONE',
    verification_status VARCHAR(30) DEFAULT 'PENDING',
    created_by_user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 4.2 Tham dinh doanh nghiep
CREATE TABLE company_verifications (
    id BIGSERIAL PRIMARY KEY,
    company_id BIGINT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    reviewed_by_faculty_id BIGINT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    status VARCHAR(30) NOT NULL,
    review_notes TEXT,
    checklist_passed JSONB,
    reviewed_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ====================================================================================================
-- PHAN HE 5: TU DIEN KY NANG ESCO & VI TRI THUC TAP (SKILLS - JOBS - PGVECTOR)
-- ====================================================================================================

-- 5.1 Tu dien ky nang ESCO
CREATE TABLE skills (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    category VARCHAR(50) NOT NULL,
    esco_uri VARCHAR(255),
    synonyms TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 5.2 Bai dang vi tri thuc tap
CREATE TABLE jobs (
    id BIGSERIAL PRIMARY KEY,
    company_id BIGINT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    target_major VARCHAR(100),
    address_id BIGINT REFERENCES addresses(id) ON DELETE SET NULL,
    location_raw VARCHAR(150),
    work_format VARCHAR(30) DEFAULT 'ONSITE',
    slots INT DEFAULT 1,
    filled_slots INT DEFAULT 0,
    stipend_range VARCHAR(100),
    benefits TEXT,
    expected_learning_outcomes TEXT,
    status VARCHAR(30) DEFAULT 'DRAFT',
    faculty_feedback TEXT,
    approved_by_user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    version INT DEFAULT 1,
    embedding vector(768),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 5.3 Ky nang yeu cau cho vi tri
CREATE TABLE job_skills (
    job_id BIGINT NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    skill_id VARCHAR(50) NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
    is_mandatory BOOLEAN DEFAULT TRUE,
    required_level VARCHAR(30) DEFAULT 'INTERMEDIATE',
    PRIMARY KEY (job_id, skill_id)
);

-- ====================================================================================================
-- PHAN HE 6: HO SO SINH VIEN, UNG TUYEN & MATCHING AI (STUDENTS - APPLICATIONS)
-- ====================================================================================================

-- 6.1 Ho so sinh vien
CREATE TABLE student_profiles (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    student_code VARCHAR(30) UNIQUE NOT NULL,
    major VARCHAR(100) NOT NULL,
    academic_year VARCHAR(20),
    gpa NUMERIC(3, 2),
    passed_credits INT,
    cv_file_url TEXT,
    portfolio_url TEXT,
    github_url TEXT,
    linkedin_url TEXT,
    bio_summary TEXT,
    preferred_province_id BIGINT REFERENCES provinces(id) ON DELETE SET NULL,
    desired_position VARCHAR(150),
    preferred_work_format VARCHAR(30) DEFAULT 'ANY',
    data_sharing_consent BOOLEAN DEFAULT TRUE,
    internship_status VARCHAR(30) DEFAULT 'NOT_STARTED',
    embedding vector(768),
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 6.2 Ky nang sinh vien
CREATE TABLE student_skills (
    student_profile_id BIGINT NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
    skill_id VARCHAR(50) NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
    proficiency_level VARCHAR(20) DEFAULT 'BEGINNER',
    years_experience NUMERIC(3, 1) DEFAULT 0,
    verified_by_exam BOOLEAN DEFAULT FALSE,
    PRIMARY KEY (student_profile_id, skill_id)
);

-- 6.3 Hoc phan da hoc (Doi sanh kien thuc nen tang)
CREATE TABLE student_courses (
    id BIGSERIAL PRIMARY KEY,
    student_profile_id BIGINT NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
    course_code VARCHAR(30) NOT NULL,
    course_name VARCHAR(150) NOT NULL,
    grade NUMERIC(3, 2),
    credits INT DEFAULT 3,
    semester VARCHAR(30)
);

-- 6.4 Chung chi ngoai ngu & Chuyen mon
CREATE TABLE student_certificates (
    id BIGSERIAL PRIMARY KEY,
    student_profile_id BIGINT NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
    certificate_name VARCHAR(150) NOT NULL,
    issuing_organization VARCHAR(150),
    issue_date DATE,
    certificate_url TEXT
);

-- ====================================================================================================
-- PHAN HE 7: KY THUC TAP CHINH THUC & PHAN CONG GVHD (TERMS - REGISTRATIONS - ASSIGNMENTS)
-- ====================================================================================================

-- 7.1 Ky thuc tap chinh thuc cua nha truong
CREATE TABLE internship_terms (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    academic_year VARCHAR(30) NOT NULL,
    semester INT NOT NULL,
    department_id BIGINT REFERENCES departments(id) ON DELETE SET NULL,
    registration_start_date DATE NOT NULL,
    registration_deadline DATE NOT NULL,
    internship_start_date DATE NOT NULL,
    internship_end_date DATE NOT NULL,
    max_credits INT DEFAULT 10,
    status VARCHAR(30) DEFAULT 'OPEN',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 7.2 Danh sach sinh vien dang ky hoc phan thuc tap (Import Excel)
CREATE TABLE term_student_registrations (
    id BIGSERIAL PRIMARY KEY,
    internship_term_id BIGINT NOT NULL REFERENCES internship_terms(id) ON DELETE CASCADE,
    student_profile_id BIGINT NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
    course_class_code VARCHAR(50),
    is_eligible BOOLEAN DEFAULT TRUE,
    imported_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_term_student UNIQUE (internship_term_id, student_profile_id)
);

-- 7.3 Phan cong Giang vien huong dan (GVHD)
CREATE TABLE supervisor_assignments (
    id BIGSERIAL PRIMARY KEY,
    internship_term_id BIGINT NOT NULL REFERENCES internship_terms(id) ON DELETE CASCADE,
    student_profile_id BIGINT NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
    lecturer_user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    assigned_by_user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    assigned_date DATE DEFAULT CURRENT_DATE,
    status VARCHAR(30) DEFAULT 'ACTIVE',
    CONSTRAINT uq_term_assignment UNIQUE (internship_term_id, student_profile_id)
);

-- 7.4 Lich su thay doi GVHD (kem ly do)
CREATE TABLE assignment_histories (
    id BIGSERIAL PRIMARY KEY,
    assignment_id BIGINT NOT NULL REFERENCES supervisor_assignments(id) ON DELETE CASCADE,
    previous_lecturer_id BIGINT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    new_lecturer_id BIGINT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    changed_by_user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    reason TEXT NOT NULL,
    changed_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 6.3 Ho so ung tuyen
CREATE TABLE applications (
    id BIGSERIAL PRIMARY KEY,
    student_profile_id BIGINT NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
    job_id BIGINT NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    cover_letter TEXT,
    ai_match_score NUMERIC(5, 2),
    status VARCHAR(30) DEFAULT 'APPLIED',
    offer_details TEXT,
    offer_deadline TIMESTAMPTZ,
    student_decision_at TIMESTAMPTZ,
    applied_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_application_student_job UNIQUE (student_profile_id, job_id)
);

-- 6.4 Ket qua AI Matching & Explainability
CREATE TABLE matching_results (
    id BIGSERIAL PRIMARY KEY,
    job_id BIGINT NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    student_profile_id BIGINT NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
    skill_score NUMERIC(5, 4),
    semantic_score NUMERIC(5, 4),
    academic_score NUMERIC(5, 4),
    overall_score NUMERIC(5, 4),
    match_percentage NUMERIC(5, 2),
    matched_skills JSONB,
    missing_skills JSONB,
    recommendation TEXT,
    calculated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_matching_pair UNIQUE (job_id, student_profile_id)
);

-- 6.5 Phong van tuyen dung
CREATE TABLE interviews (
    id BIGSERIAL PRIMARY KEY,
    application_id BIGINT NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    created_by_user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    title VARCHAR(200) NOT NULL,
    interview_type VARCHAR(50) DEFAULT 'ONLINE',
    scheduled_start TIMESTAMPTZ NOT NULL,
    scheduled_end TIMESTAMPTZ,
    meeting_url VARCHAR(500),
    location_details TEXT,
    notes TEXT,
    status VARCHAR(30) DEFAULT 'SCHEDULED',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 6.6 Nguoi tham gia phong van
CREATE TABLE interview_participants (
    id BIGSERIAL PRIMARY KEY,
    interview_id BIGINT NOT NULL REFERENCES interviews(id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    participant_role VARCHAR(50) DEFAULT 'INTERVIEWER',
    joined_at TIMESTAMPTZ,
    status VARCHAR(30) DEFAULT 'INVITED',
    CONSTRAINT uq_interview_user UNIQUE (interview_id, user_id)
);

-- ====================================================================================================
-- PHAN HE 7: THOA THUAN 3 BEN ERASMUS+ (LEARNING AGREEMENTS & AMENDMENTS)
-- ====================================================================================================

-- 9.1 Thoa thuan hoc tap 3 ben (Chuan Erasmus+ Before Mobility)
CREATE TABLE learning_agreements (
    id BIGSERIAL PRIMARY KEY,
    internship_term_id BIGINT REFERENCES internship_terms(id) ON DELETE RESTRICT,
    application_id BIGINT UNIQUE NOT NULL REFERENCES applications(id) ON DELETE RESTRICT,
    student_id BIGINT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    academic_supervisor_id BIGINT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    company_mentor_id BIGINT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    
    educational_objectives TEXT NOT NULL,
    detailed_tasks TEXT NOT NULL,
    knowledge_skills_to_acquire TEXT,
    confidentiality_agreed BOOLEAN DEFAULT TRUE,
    work_hours_per_week INT DEFAULT 40,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    
    version INT DEFAULT 1,
    status VARCHAR(30) DEFAULT 'DRAFT',
    
    student_signed BOOLEAN DEFAULT FALSE,
    student_signed_at TIMESTAMPTZ,
    
    mentor_signed BOOLEAN DEFAULT FALSE,
    mentor_signed_at TIMESTAMPTZ,
    
    supervisor_signed BOOLEAN DEFAULT FALSE,
    supervisor_signed_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 9.2 Lich su sua doi thoa thuan 3 ben
CREATE TABLE agreement_amendments (
    id BIGSERIAL PRIMARY KEY,
    learning_agreement_id BIGINT NOT NULL REFERENCES learning_agreements(id) ON DELETE CASCADE,
    version_number INT NOT NULL,
    reason_for_change TEXT NOT NULL,
    changes_summary JSONB NOT NULL,
    approved_by_student BOOLEAN DEFAULT FALSE,
    approved_by_mentor BOOLEAN DEFAULT FALSE,
    approved_by_supervisor BOOLEAN DEFAULT FALSE,
    amended_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ====================================================================================================
-- PHAN HE 10: NHAT KY, SU CO & DANH GIA RUBRIC NACE (LOGBOOKS - INCIDENTS - RUBRICS)
-- ====================================================================================================

-- 10.1 Nhat ky thuc tap theo tuan
CREATE TABLE logbooks (
    id BIGSERIAL PRIMARY KEY,
    learning_agreement_id BIGINT NOT NULL REFERENCES learning_agreements(id) ON DELETE CASCADE,
    week_number INT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    tasks_performed TEXT NOT NULL,
    learned_skills TEXT,
    evidence_url TEXT,
    hours_logged NUMERIC(5, 1) DEFAULT 0,
    status VARCHAR(30) DEFAULT 'SUBMITTED',
    mentor_feedback TEXT,
    mentor_rating INT CHECK (mentor_rating BETWEEN 1 AND 5),
    supervisor_notes TEXT,
    supervisor_reviewed_at TIMESTAMPTZ,
    submitted_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_logbook_week UNIQUE (learning_agreement_id, week_number)
);

-- 10.2 Theo doi su co & Quan ly rui ro (ILO 208 Grievance & Safeguarding)
CREATE TABLE internship_incidents (
    id BIGSERIAL PRIMARY KEY,
    learning_agreement_id BIGINT NOT NULL REFERENCES learning_agreements(id) ON DELETE CASCADE,
    reported_by_user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    incident_type VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    student_explanation TEXT,
    student_evidence_url TEXT,
    severity VARCHAR(20) DEFAULT 'MEDIUM',
    resolution_status VARCHAR(30) DEFAULT 'OPEN',
    resolution_notes TEXT,
    resolved_by_user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    reported_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMPTZ
);

-- 10.3 Khung nang luc nghe nghiep NACE
CREATE TABLE nace_competencies (
    code VARCHAR(30) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT
);

-- 10.4 Phieu danh gia Rubric da chieu (DN + GVHD + Tu danh gia + Hoi dong)
CREATE TABLE rubric_evaluations (
    id BIGSERIAL PRIMARY KEY,
    learning_agreement_id BIGINT NOT NULL REFERENCES learning_agreements(id) ON DELETE CASCADE,
    evaluation_type VARCHAR(20) NOT NULL,
    evaluator_role VARCHAR(30) NOT NULL, -- COMPANY_MENTOR, ACADEMIC_SUPERVISOR, STUDENT_SELF, COUNCIL_MEMBER
    evaluator_user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    total_score NUMERIC(4, 2),
    strengths_observed TEXT,
    areas_for_improvement TEXT,
    future_recommendations TEXT,
    evaluated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_rubric_eval UNIQUE (learning_agreement_id, evaluation_type, evaluator_role, evaluator_user_id)
);

-- 10.5 Diem chi tiet tung tieu chi NACE
CREATE TABLE rubric_criteria_scores (
    id BIGSERIAL PRIMARY KEY,
    evaluation_id BIGINT NOT NULL REFERENCES rubric_evaluations(id) ON DELETE CASCADE,
    competency_code VARCHAR(30) NOT NULL REFERENCES nace_competencies(code) ON DELETE RESTRICT,
    score NUMERIC(3, 1) NOT NULL CHECK (score BETWEEN 0 AND 10),
    behavioral_evidence TEXT,
    CONSTRAINT uq_criteria_score UNIQUE (evaluation_id, competency_code)
);

-- ====================================================================================================
-- PHAN HE 11: KHIEU NAI, THONG BAO & KHAO SAT CHAT LUONG (APPEALS - NOTIFICATIONS - SURVEYS)
-- ====================================================================================================

-- 11.1 Khieu nai va xu ly tranh chap
CREATE TABLE internship_appeals (
    id BIGSERIAL PRIMARY KEY,
    learning_agreement_id BIGINT NOT NULL REFERENCES learning_agreements(id) ON DELETE CASCADE,
    student_user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    appeal_type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    evidence_url TEXT,
    status VARCHAR(30) DEFAULT 'PENDING',
    response_content TEXT,
    handled_by_user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMPTZ
);

-- 9.1 Thong bao nguoi dung
CREATE TABLE notifications (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'GENERAL',
    is_read BOOLEAN DEFAULT FALSE,
    action_url VARCHAR(500),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 9.2 Khao sat muc do hai long
CREATE TABLE satisfaction_surveys (
    id BIGSERIAL PRIMARY KEY,
    learning_agreement_id BIGINT NOT NULL REFERENCES learning_agreements(id) ON DELETE CASCADE,
    submitted_by_user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    target_type VARCHAR(50) NOT NULL,
    satisfaction_score INT NOT NULL CHECK (satisfaction_score BETWEEN 1 AND 5),
    work_environment_rating INT CHECK (work_environment_rating BETWEEN 1 AND 5),
    mentor_support_rating INT CHECK (mentor_support_rating BETWEEN 1 AND 5),
    would_recommend BOOLEAN DEFAULT TRUE,
    comments TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ====================================================================================================
-- PERFORMANCE INDEXES (INDEX VECTOR HNSW & B-TREE)
-- ====================================================================================================

-- Vector Cosine Index cho AI Search (Gemini 768-dim embeddings)
CREATE INDEX idx_jobs_embedding ON jobs USING hnsw (embedding vector_cosine_ops);
CREATE INDEX idx_students_embedding ON student_profiles USING hnsw (embedding vector_cosine_ops);

-- B-Tree Indexes tra cuu nhanh
CREATE INDEX idx_users_email ON users (email);
CREATE INDEX idx_users_role ON users (role);
CREATE INDEX idx_student_code ON student_profiles (student_code);
CREATE INDEX idx_jobs_company ON jobs (company_id);
CREATE INDEX idx_jobs_status ON jobs (status);
CREATE INDEX idx_applications_student ON applications (student_profile_id);
CREATE INDEX idx_applications_job ON applications (job_id);
CREATE INDEX idx_applications_status ON applications (status);
CREATE INDEX idx_matching_scores ON matching_results (job_id, overall_score DESC);
CREATE INDEX idx_logbooks_agreement ON logbooks (learning_agreement_id, week_number);
CREATE INDEX idx_notifications_unread ON notifications (user_id, is_read);
CREATE INDEX idx_addresses_ward ON addresses (ward_id);

-- ====================================================================================================
-- DU LIEU KHOI TAO MAU (SEED DATA)
-- ====================================================================================================

-- 1. Tinh / Thanh pho
INSERT INTO provinces (id, province_name, code) OVERRIDING SYSTEM VALUE VALUES
(1, 'Thanh pho Ho Chi Minh', '79'),
(2, 'Thanh pho Ha Noi', '01'),
(3, 'Thanh pho Da Nang', '48'),
(4, 'Tinh Binh Duong', '74'),
(5, 'Tinh Dong Nai', '75'),
(6, 'Thanh pho Can Tho', '92')
ON CONFLICT (code) DO NOTHING;

-- 2. Quan / Huyen
INSERT INTO districts (id, province_id, district_name, code) OVERRIDING SYSTEM VALUE VALUES
(1, 1, 'Thanh pho Thu Duc', '769'),
(2, 1, 'Quan 1', '760'),
(3, 1, 'Quan 7', '778'),
(4, 2, 'Quan Cau Giay', '005'),
(5, 3, 'Quan Hai Chau', '490')
ON CONFLICT DO NOTHING;

-- 3. Phuong / Xa
INSERT INTO wards (id, district_id, ward_name, code) OVERRIDING SYSTEM VALUE VALUES
(1, 1, 'Phuong Linh Chieu', '26734'),
(2, 1, 'Phuong Tang Nhon Phu A', '26740'),
(3, 2, 'Phuong Ben Nghe', '26743'),
(4, 4, 'Phuong Dich Vong Hau', '00160')
ON CONFLICT DO NOTHING;

-- 4. Dia chi chi tiet
INSERT INTO addresses (id, ward_id, address_line, region_type) OVERRIDING SYSTEM VALUE VALUES
(1, 1, 'So 1 Vo Van Ngan, Phuong Linh Chieu, TP. Thu Duc', 'CAMPUS'),
(2, 2, 'Khu Cong Nghe Cao (SHTP), TP. Thu Duc', 'HEADQUARTERS'),
(3, 3, 'Toa nha Bitexco, So 2 Hai Trieu, Ben Nghe, Quan 1', 'HEADQUARTERS')
ON CONFLICT DO NOTHING;

-- 5. Truong dai hoc & Khoa
INSERT INTO universities (id, university_name, code, website, address_id) OVERRIDING SYSTEM VALUE VALUES
(1, 'Truong Dai hoc Su pham Ky thuat TP.HCM', 'HCMUTE', 'https://hcmute.edu.vn', 1)
ON CONFLICT (code) DO NOTHING;

INSERT INTO departments (id, university_id, department_name, department_type, description) OVERRIDING SYSTEM VALUE VALUES
(1, 1, 'Khoa Cong nghe Thong tin', 'FACULTY', 'Quan ly sinh vien nganh CNTT, KTPM, TTNT'),
(2, 1, 'Bo mon Ky thuat Phan mem', 'ACADEMIC_DEPARTMENT', 'Chuyen mon phat trien phan mem'),
(3, 1, 'Phong Quan tri Thuc tap & Quan he Doanh nghiep', 'INTERNSHIP_OFFICE', 'Dieu phoi thoa thuan hop tac doanh nghiep')
ON CONFLICT DO NOTHING;

-- 6. Khung 8 nang luc NACE
INSERT INTO nace_competencies (code, name, description) VALUES
('CRITICAL_THINKING', 'Tu duy phan bien & Giai quyet van de', 'Phan tich thong tin va giai quyet van de ky thuat phuc tap.'),
('COMMUNICATION', 'Giao tiep & Truyen dat', 'Ky nang lang nghe, trinh bay y tuong ro rang qua van ban va thuyet trinh.'),
('TEAMWORK', 'Lam viec nhom & Hop tac', 'Xay dung moi quan he lam viec hieu qua va dong gop vao muc tieu chung.'),
('TECHNOLOGY', 'Ung dung cong nghe & Chuyen mon', 'Lam chu cac cong cu, ngon ngu lap trinh va kien truc he thong.'),
('LEADERSHIP', 'Nang luc lanh dao', 'Chu dong nhan trach nhiem va tao dong luc cho cac thanh vien.'),
('PROFESSIONALISM', 'Tac phong nghe nghiep & Dao duc', 'Dung gio, tuan thu ky luat lao dong va dao duc nghe nghiep.'),
('CAREER_DEV', 'Phat trien ban than & Nghe nghiep', 'Chu dong hoc hoi cong nghe moi va tiep thu phan hoi.'),
('EQUITY_INCLUSION', 'Hoa nhap & Thich ung moi truong', 'Ton trong su da dang van hoa va thich nghi tot voi moi truong.')
ON CONFLICT (code) DO NOTHING;

-- 7. Tu dien Ky nang IT chuan ESCO
INSERT INTO skills (id, name, category, esco_uri, synonyms) VALUES
('SK-JAVA', 'Java', 'Programming Language', 'http://data.europa.eu/esco/skill/java', 'core java, java 8, java 17, java 21'),
('SK-SPRING-BOOT', 'Spring Boot', 'Backend', 'http://data.europa.eu/esco/skill/spring-boot', 'spring framework, spring mvc, spring security, spring data jpa'),
('SK-PYTHON', 'Python', 'Programming Language', 'http://data.europa.eu/esco/skill/python', 'python3, py, python programming'),
('SK-FASTAPI', 'FastAPI', 'Backend', 'http://data.europa.eu/esco/skill/fastapi', 'fastapi framework, pydantic, starlette'),
('SK-POSTGRESQL', 'PostgreSQL', 'Database', 'http://data.europa.eu/esco/skill/postgresql', 'postgres, postgresql database, pgsql'),
('SK-PGVECTOR', 'pgvector', 'Database', 'http://data.europa.eu/esco/skill/pgvector', 'vector database, similarity search, embeddings store'),
('SK-REACT', 'React', 'Frontend', 'http://data.europa.eu/esco/skill/react', 'reactjs, react.js, react hooks'),
('SK-NEXTJS', 'Next.js', 'Frontend', 'http://data.europa.eu/esco/skill/nextjs', 'nextjs 14, next.js app router, server components'),
('SK-TYPESCRIPT', 'TypeScript', 'Programming Language', 'http://data.europa.eu/esco/skill/typescript', 'ts, typing javascript'),
('SK-TAILWINDCSS', 'Tailwind CSS', 'Frontend', 'http://data.europa.eu/esco/skill/tailwindcss', 'tailwind, tailwindcss 3'),
('SK-DOCKER', 'Docker', 'DevOps', 'http://data.europa.eu/esco/skill/docker', 'docker container, docker compose, dockerization'),
('SK-GIT', 'Git', 'DevOps', 'http://data.europa.eu/esco/skill/git', 'git workflow, github, gitlab, version control'),
('SK-REST-API', 'RESTful API', 'Backend', 'http://data.europa.eu/esco/skill/restful-api', 'rest api, restful web services, api design'),
('SK-GEMINI-AI', 'Google Gemini AI', 'AI/ML', 'http://data.europa.eu/esco/skill/gemini-ai', 'gemini 1.5, llm, prompt engineering, generative ai'),
('SK-TEAMWORK', 'Teamwork', 'SoftSkill', 'http://data.europa.eu/esco/skill/teamwork', 'lam viec nhom, cong tac, collaboration'),
('SK-COMMUNICATION', 'Communication', 'SoftSkill', 'http://data.europa.eu/esco/skill/communication', 'giao tiep, presentation, interpersonal skills')
ON CONFLICT (id) DO NOTHING;

-- 8. Tai khoan Demo cho 6 vai tro
INSERT INTO users (id, email, password_hash, full_name, phone_number, role, department_id, is_active) OVERRIDING SYSTEM VALUE VALUES
(1, 'admin@internlink.edu.vn', '$2a$10$7R.U0zX8U.Y88i8cSmgDse6WlWvhH.B18gJkU0xM0Jc9y0yHw4Y.2', 'Quan Tri Vien He Thong', '0901112233', 'ADMIN', 1, TRUE),
(2, 'khoa.cntt@internlink.edu.vn', '$2a$10$7R.U0zX8U.Y88i8cSmgDse6WlWvhH.B18gJkU0xM0Jc9y0yHw4Y.2', 'Ban Chu Nhiem Khoa CNTT', '0902223344', 'FACULTY_ADMIN', 1, TRUE),
(3, 'gv.nguyenan@internlink.edu.vn', '$2a$10$7R.U0zX8U.Y88i8cSmgDse6WlWvhH.B18gJkU0xM0Jc9y0yHw4Y.2', 'TS. Nguyen Van An', '0903334455', 'LECTURER', 2, TRUE),
(4, 'hr@fptsoftware.com', '$2a$10$7R.U0zX8U.Y88i8cSmgDse6WlWvhH.B18gJkU0xM0Jc9y0yHw4Y.2', 'Dai Dien Tuyen Dung FPT', '0904445566', 'COMPANY_REP', NULL, TRUE),
(5, 'mentor.tech@fptsoftware.com', '$2a$10$7R.U0zX8U.Y88i8cSmgDse6WlWvhH.B18gJkU0xM0Jc9y0yHw4Y.2', 'Tech Lead Tran Bao Mentor', '0905556677', 'COMPANY_MENTOR', NULL, TRUE),
(6, 'sinhvien.hao@internlink.edu.vn', '$2a$10$7R.U0zX8U.Y88i8cSmgDse6WlWvhH.B18gJkU0xM0Jc9y0yHw4Y.2', 'Le Nguyen Hao (Sinh vien)', '0906667788', 'STUDENT', 1, TRUE)
ON CONFLICT (email) DO NOTHING;

-- 9. Doanh nghiep mau
INSERT INTO companies (id, name, tax_code, industry, website, address_id, contact_name, contact_email, contact_phone, description, work_environment_info, mou_status, verification_status, created_by_user_id) OVERRIDING SYSTEM VALUE VALUES
(1, 'FPT Software TP.HCM', '0101778163', 'Software Development & AI', 'https://fptsoftware.com', 2, 'Dai Dien Tuyen Dung FPT', 'hr@fptsoftware.com', '0904445566', 'Doanh nghiep phan mem va dich vu CNTT hang dau Viet Nam.', 'Moi truong lam viec hien dai, trang bi laptop, khu pantry, phong the thao, tuan thu an toan lao dong.', 'SIGNED', 'VERIFIED', 4)
ON CONFLICT (tax_code) DO NOTHING;

-- 10. Vi tri tuyen dung mau (Slots = 5)
INSERT INTO jobs (id, company_id, title, description, target_major, address_id, location_raw, work_format, slots, filled_slots, stipend_range, benefits, expected_learning_outcomes, status, version) OVERRIDING SYSTEM VALUE VALUES
(1, 1, 'Thuc tap sinh Java Backend Developer (Spring Boot / pgvector)', 
 'Tham gia phat trien he thong microservices quan ly du lieu lon, xay dung RESTful APIs, toi uu hoa truy van PostgreSQL va tich hop Vector Search.', 
 'Ky thuat phan mem', 2, 'Khu Cong Nghe Cao (SHTP), TP. Thu Duc', 'HYBRID', 5, 0, '6,000,000 - 8,000,000 VND / thang', 
 'Ho tro may tinh lam viec, thu lao hang thang, tham gia cac khoa dao tao noi bo va co co hoi nhan offer chinh thuc.', 
 'Lam chu Spring Boot 3, RESTful APIs, thiet ke kien truc DB va quy trinh lam viec Agile/Scrum chuyen nghiep.', 'APPROVED', 1)
ON CONFLICT DO NOTHING;

-- 11. Ky nang yeu cau vi tri mau
INSERT INTO job_skills (job_id, skill_id, is_mandatory, required_level) VALUES
(1, 'SK-JAVA', TRUE, 'INTERMEDIATE'),
(1, 'SK-SPRING-BOOT', TRUE, 'INTERMEDIATE'),
(1, 'SK-POSTGRESQL', TRUE, 'BEGINNER'),
(1, 'SK-DOCKER', FALSE, 'BEGINNER'),
(1, 'SK-GIT', TRUE, 'INTERMEDIATE'),
(1, 'SK-TEAMWORK', FALSE, 'BEGINNER')
ON CONFLICT DO NOTHING;

-- 12. Ho so sinh vien mau
INSERT INTO student_profiles (id, user_id, student_code, major, academic_year, gpa, passed_credits, bio_summary, preferred_province_id, desired_position, preferred_work_format, internship_status) OVERRIDING SYSTEM VALUE VALUES
(1, 6, '21110001', 'Ky thuat phan mem', 'K2021', 3.45, 120, 'Sinh vien nam cuoi dam me phat trien Backend voi Java Spring Boot va tich hop AI.', 1, 'Java Backend Developer', 'HYBRID', 'LOOKING_FOR_JOB')
ON CONFLICT (student_code) DO NOTHING;

INSERT INTO student_skills (student_profile_id, skill_id, proficiency_level, years_experience) VALUES
(1, 'SK-JAVA', 'INTERMEDIATE', 2.0),
(1, 'SK-SPRING-BOOT', 'INTERMEDIATE', 1.5),
(1, 'SK-POSTGRESQL', 'INTERMEDIATE', 1.0),
(1, 'SK-GIT', 'ADVANCED', 2.5),
(1, 'SK-FASTAPI', 'BEGINNER', 0.5)
ON CONFLICT DO NOTHING;

-- 13. Ky thuc tap mau
INSERT INTO internship_terms (id, name, academic_year, semester, department_id, registration_start_date, registration_deadline, internship_start_date, internship_end_date, max_credits, status) OVERRIDING SYSTEM VALUE VALUES
(1, 'Hoc ky 1 - Nam hoc 2026-2027', '2026-2027', 1, 1, '2026-08-01', '2026-09-15', '2026-09-20', '2027-01-15', 10, 'OPEN')
ON CONFLICT DO NOTHING;

-- 14. Dang ky hoc phan thuc tap mau (Import Excel)
INSERT INTO term_student_registrations (id, internship_term_id, student_profile_id, course_class_code, is_eligible) OVERRIDING SYSTEM VALUE VALUES
(1, 1, 1, 'INTP4312_01', TRUE)
ON CONFLICT DO NOTHING;

-- 15. Phan cong GVHD mau
INSERT INTO supervisor_assignments (id, internship_term_id, student_profile_id, lecturer_user_id, assigned_by_user_id, assigned_date, status) OVERRIDING SYSTEM VALUE VALUES
(1, 1, 1, 3, 2, '2026-09-05', 'ACTIVE')
ON CONFLICT DO NOTHING;

-- Dat lai Sequence cho cac bang tu tang
SELECT setval(pg_get_serial_sequence('provinces', 'id'), coalesce(max(id),0) + 1, false) FROM provinces;
SELECT setval(pg_get_serial_sequence('districts', 'id'), coalesce(max(id),0) + 1, false) FROM districts;
SELECT setval(pg_get_serial_sequence('wards', 'id'), coalesce(max(id),0) + 1, false) FROM wards;
SELECT setval(pg_get_serial_sequence('addresses', 'id'), coalesce(max(id),0) + 1, false) FROM addresses;
SELECT setval(pg_get_serial_sequence('universities', 'id'), coalesce(max(id),0) + 1, false) FROM universities;
SELECT setval(pg_get_serial_sequence('departments', 'id'), coalesce(max(id),0) + 1, false) FROM departments;
SELECT setval(pg_get_serial_sequence('users', 'id'), coalesce(max(id),0) + 1, false) FROM users;
SELECT setval(pg_get_serial_sequence('companies', 'id'), coalesce(max(id),0) + 1, false) FROM companies;
SELECT setval(pg_get_serial_sequence('jobs', 'id'), coalesce(max(id),0) + 1, false) FROM jobs;
SELECT setval(pg_get_serial_sequence('student_profiles', 'id'), coalesce(max(id),0) + 1, false) FROM student_profiles;
SELECT setval(pg_get_serial_sequence('internship_terms', 'id'), coalesce(max(id),0) + 1, false) FROM internship_terms;
SELECT setval(pg_get_serial_sequence('term_student_registrations', 'id'), coalesce(max(id),0) + 1, false) FROM term_student_registrations;
SELECT setval(pg_get_serial_sequence('supervisor_assignments', 'id'), coalesce(max(id),0) + 1, false) FROM supervisor_assignments;
