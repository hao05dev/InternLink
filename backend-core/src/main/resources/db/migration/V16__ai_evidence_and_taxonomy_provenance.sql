ALTER TABLE student_skills ADD COLUMN IF NOT EXISTS ai_evidence JSONB NOT NULL DEFAULT '{}';
ALTER TABLE skill_taxonomies ADD COLUMN IF NOT EXISTS external_uri TEXT;
ALTER TABLE skill_taxonomies ALTER COLUMN framework SET DEFAULT 'INTERNLINK';
UPDATE skill_taxonomies SET framework = 'INTERNLINK', taxonomy_version = 'internlink-it-v1'
WHERE id LIKE 'SK-%' AND framework = 'ESCO';
