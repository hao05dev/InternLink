-- ====================================================================
-- INTERNLINK MIGRATION V23: ADD BLOG_MANAGER ROLE
-- Standard password for seeded account: "Password@123"
-- BCrypt Hash: $2a$10$V04qPky6yVn5nff2zFkWveXlJ/z46L.G9v72xT74z7rK9n0W1WzK6
-- ====================================================================

-- 1. Update check constraint on users table to allow BLOG_MANAGER
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check 
    CHECK (role IN ('STUDENT', 'COMPANY_REP', 'COMPANY_MENTOR', 'LECTURER', 'FACULTY_ADMIN', 'ADMIN', 'BLOG_MANAGER'));

-- 2. Seed demo account for BLOG_MANAGER
INSERT INTO users (
    id,
    department_id,
    company_id,
    email,
    password_hash,
    full_name,
    phone_number,
    role,
    must_change_password,
    is_active
)
VALUES (
    'b1090000-0000-0000-0000-000000000001',
    '11111111-1111-1111-1111-111111111111',
    NULL,
    'editor.blog@ctu.edu.vn',
    '$2a$10$V04qPky6yVn5nff2zFkWveXlJ/z46L.G9v72xT74z7rK9n0W1WzK6',
    'Biên tập viên Ban Truyền thông CICT',
    '0901234567',
    'BLOG_MANAGER',
    FALSE,
    TRUE
)
ON CONFLICT (email) DO NOTHING;
