CREATE TABLE introduction_letter_requests (
    id UUID PRIMARY KEY,
    student_id UUID NOT NULL REFERENCES users(id),
    term_id UUID NOT NULL REFERENCES internship_terms(id),
    target_company_name VARCHAR(255) NOT NULL,
    target_position VARCHAR(255),
    reason TEXT,
    status VARCHAR(32) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'ISSUED', 'REJECTED', 'CANCELLED')),
    issued_code VARCHAR(64) UNIQUE,
    issue_note TEXT,
    processed_by_user_id UUID REFERENCES users(id),
    processed_at TIMESTAMPTZ,
    received_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    version INT NOT NULL DEFAULT 0
);

CREATE INDEX idx_intro_letter_student ON introduction_letter_requests(student_id);
CREATE INDEX idx_intro_letter_term ON introduction_letter_requests(term_id);
CREATE INDEX idx_intro_letter_status ON introduction_letter_requests(status);
