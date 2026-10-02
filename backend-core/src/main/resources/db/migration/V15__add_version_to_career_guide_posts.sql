-- ====================================================================
-- INTERNLINK MIGRATION V15: ADD VERSION COLUMN TO CAREER_GUIDE_POSTS
-- Required for JPA Optimistic Locking (BaseEntity inheritance)
-- ====================================================================

ALTER TABLE career_guide_posts
    ADD COLUMN IF NOT EXISTS version INT NOT NULL DEFAULT 0;
