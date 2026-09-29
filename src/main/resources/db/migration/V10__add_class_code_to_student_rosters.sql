-- V10: Add class_code to student_rosters table
ALTER TABLE student_rosters ADD COLUMN IF NOT EXISTS class_code VARCHAR(50);
