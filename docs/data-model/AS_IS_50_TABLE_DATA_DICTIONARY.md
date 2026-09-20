# AS-IS Data Dictionary - 50 bảng

Nguồn: Flyway `V1-V4` trên nhánh `archive/current-full-system`. Ký hiệu: `PK` khóa chính, `FK` khóa ngoại, `NN` bắt buộc, `UQ` duy nhất.

## A. 49 thực thể nghiệp vụ

### 1. provinces

| Thuộc tính | Kiểu | Ràng buộc / liên kết |
|---|---|---|
| `id` | `BIGSERIAL` | PK |
| `province_name` | `VARCHAR(200)` | NN |
| `code` | `VARCHAR(50)` | NN; UQ |
| `created_at` | `TIMESTAMPTZ` | default: CURRENT_TIMESTAMP |

### 2. districts

| Thuộc tính | Kiểu | Ràng buộc / liên kết |
|---|---|---|
| `id` | `BIGSERIAL` | PK |
| `province_id` | `BIGINT` | NN; FK → provinces.id |
| `district_name` | `VARCHAR(200)` | NN |
| `code` | `VARCHAR(50)` |  |
| `created_at` | `TIMESTAMPTZ` | default: CURRENT_TIMESTAMP |

### 3. wards

| Thuộc tính | Kiểu | Ràng buộc / liên kết |
|---|---|---|
| `id` | `BIGSERIAL` | PK |
| `district_id` | `BIGINT` | NN; FK → districts.id |
| `ward_name` | `VARCHAR(200)` | NN |
| `code` | `VARCHAR(50)` |  |
| `created_at` | `TIMESTAMPTZ` | default: CURRENT_TIMESTAMP |

### 4. addresses

| Thuộc tính | Kiểu | Ràng buộc / liên kết |
|---|---|---|
| `id` | `BIGSERIAL` | PK |
| `ward_id` | `BIGINT` | FK → wards.id |
| `address_line` | `VARCHAR(255)` | NN |
| `region_type` | `VARCHAR(30)` | default: 'HEADQUARTERS' |
| `postal_code` | `VARCHAR(20)` |  |
| `latitude` | `NUMERIC(10, 7)` |  |
| `longitude` | `NUMERIC(10, 7)` |  |
| `created_at` | `TIMESTAMPTZ` | default: CURRENT_TIMESTAMP |
| `updated_at` | `TIMESTAMPTZ` | default: CURRENT_TIMESTAMP |

### 5. universities

| Thuộc tính | Kiểu | Ràng buộc / liên kết |
|---|---|---|
| `id` | `BIGSERIAL` | PK |
| `university_name` | `VARCHAR(500)` | NN |
| `code` | `VARCHAR(50)` | NN; UQ |
| `website` | `VARCHAR(255)` |  |
| `address_id` | `BIGINT` | FK → addresses.id |
| `created_at` | `TIMESTAMPTZ` | default: CURRENT_TIMESTAMP |

### 6. departments

| Thuộc tính | Kiểu | Ràng buộc / liên kết |
|---|---|---|
| `id` | `BIGSERIAL` | PK |
| `university_id` | `BIGINT` | NN; FK → universities.id |
| `department_name` | `VARCHAR(150)` | NN |
| `department_type` | `VARCHAR(50)` | NN; default: 'FACULTY' |
| `description` | `TEXT` |  |
| `status` | `VARCHAR(30)` | default: 'ACTIVE' |
| `created_at` | `TIMESTAMPTZ` | default: CURRENT_TIMESTAMP |

### 7. users

| Thuộc tính | Kiểu | Ràng buộc / liên kết |
|---|---|---|
| `id` | `BIGSERIAL` | PK |
| `email` | `VARCHAR(150)` | NN; UQ |
| `password_hash` | `VARCHAR(255)` | NN |
| `full_name` | `VARCHAR(150)` | NN |
| `phone_number` | `VARCHAR(20)` |  |
| `role` | `VARCHAR(30)` | NN |
| `department_id` | `BIGINT` | FK → departments.id |
| `avatar_url` | `TEXT` |  |
| `is_active` | `BOOLEAN` | default: TRUE |
| `created_at` | `TIMESTAMPTZ` | default: CURRENT_TIMESTAMP |
| `updated_at` | `TIMESTAMPTZ` | default: CURRENT_TIMESTAMP |

### 8. companies

| Thuộc tính | Kiểu | Ràng buộc / liên kết |
|---|---|---|
| `id` | `BIGSERIAL` | PK |
| `name` | `VARCHAR(255)` | NN |
| `tax_code` | `VARCHAR(50)` | UQ |
| `industry` | `VARCHAR(100)` |  |
| `website` | `VARCHAR(255)` |  |
| `address_id` | `BIGINT` | FK → addresses.id |
| `address_raw` | `TEXT` |  |
| `contact_name` | `VARCHAR(150)` |  |
| `contact_email` | `VARCHAR(150)` |  |
| `contact_phone` | `VARCHAR(20)` |  |
| `description` | `TEXT` |  |
| `work_environment_info` | `TEXT` |  |
| `mou_status` | `VARCHAR(30)` | default: 'NONE' |
| `verification_status` | `VARCHAR(30)` | default: 'PENDING' |
| `created_by_user_id` | `BIGINT` | FK → users.id |
| `created_at` | `TIMESTAMPTZ` | default: CURRENT_TIMESTAMP |
| `updated_at` | `TIMESTAMPTZ` | default: CURRENT_TIMESTAMP |

### 9. company_verifications

| Thuộc tính | Kiểu | Ràng buộc / liên kết |
|---|---|---|
| `id` | `BIGSERIAL` | PK |
| `company_id` | `BIGINT` | NN; FK → companies.id |
| `reviewed_by_faculty_id` | `BIGINT` | NN; FK → users.id |
| `status` | `VARCHAR(30)` | NN |
| `review_notes` | `TEXT` |  |
| `checklist_passed` | `JSONB` |  |
| `reviewed_at` | `TIMESTAMPTZ` | default: CURRENT_TIMESTAMP |

### 10. department_company_partnerships

| Thuộc tính | Kiểu | Ràng buộc / liên kết |
|---|---|---|
| `id` | `BIGSERIAL` | PK |
| `department_id` | `BIGINT` | NN; FK → departments.id |
| `company_id` | `BIGINT` | NN; FK → companies.id |
| `partnership_status` | `VARCHAR(30)` | NN; default: 'ACTIVE' |
| `mou_code` | `VARCHAR(100)` |  |
| `mou_file_url` | `TEXT` |  |
| `valid_from` | `DATE` | default: CURRENT_DATE |
| `valid_to` | `DATE` |  |
| `notes` | `TEXT` |  |
| `approved_by_user_id` | `BIGINT` | FK → users.id |
| `created_at` | `TIMESTAMPTZ` | default: CURRENT_TIMESTAMP |
| `updated_at` | `TIMESTAMPTZ` | default: CURRENT_TIMESTAMP |

### 11. skills

| Thuộc tính | Kiểu | Ràng buộc / liên kết |
|---|---|---|
| `id` | `VARCHAR(50)` | PK |
| `name` | `VARCHAR(100)` | NN; UQ |
| `category` | `VARCHAR(50)` | NN |
| `esco_uri` | `VARCHAR(255)` |  |
| `synonyms` | `TEXT` |  |
| `created_at` | `TIMESTAMPTZ` | default: CURRENT_TIMESTAMP |

### 12. jobs

| Thuộc tính | Kiểu | Ràng buộc / liên kết |
|---|---|---|
| `id` | `BIGSERIAL` | PK |
| `company_id` | `BIGINT` | NN; FK → companies.id |
| `department_id` | `BIGINT` | FK → departments.id |
| `title` | `VARCHAR(200)` | NN |
| `description` | `TEXT` | NN |
| `target_major` | `VARCHAR(100)` |  |
| `address_id` | `BIGINT` | FK → addresses.id |
| `location_raw` | `VARCHAR(150)` |  |
| `work_format` | `VARCHAR(30)` | default: 'ONSITE' |
| `slots` | `INT` | default: 1 |
| `filled_slots` | `INT` | default: 0 |
| `stipend_range` | `VARCHAR(100)` |  |
| `benefits` | `TEXT` |  |
| `expected_learning_outcomes` | `TEXT` |  |
| `status` | `VARCHAR(30)` | default: 'DRAFT' |
| `faculty_feedback` | `TEXT` |  |
| `approved_by_user_id` | `BIGINT` | FK → users.id |
| `version` | `INT` | default: 1 |
| `embedding` | `vector(768)` |  |
| `created_at` | `TIMESTAMPTZ` | default: CURRENT_TIMESTAMP |
| `updated_at` | `TIMESTAMPTZ` | default: CURRENT_TIMESTAMP |

### 13. job_skills

| Thuộc tính | Kiểu | Ràng buộc / liên kết |
|---|---|---|
| `job_id` | `BIGINT` | NN; FK → jobs.id |
| `skill_id` | `VARCHAR(50)` | NN; FK → skills.id |
| `is_mandatory` | `BOOLEAN` | default: TRUE |
| `required_level` | `VARCHAR(30)` | default: 'INTERMEDIATE' |

### 14. student_rosters

| Thuộc tính | Kiểu | Ràng buộc / liên kết |
|---|---|---|
| `id` | `BIGSERIAL` | PK |
| `department_id` | `BIGINT` | NN; FK → departments.id |
| `student_code` | `VARCHAR(30)` | NN; UQ |
| `official_email` | `VARCHAR(150)` | NN; UQ |
| `full_name` | `VARCHAR(150)` | NN |
| `major` | `VARCHAR(100)` | NN |
| `academic_year` | `VARCHAR(20)` |  |
| `class_code` | `VARCHAR(50)` |  |
| `gpa` | `NUMERIC(3, 2)` | default: 0.0 |
| `is_claimed` | `BOOLEAN` | default: FALSE |
| `claimed_user_id` | `BIGINT` | FK → users.id |
| `claimed_at` | `TIMESTAMPTZ` |  |
| `created_at` | `TIMESTAMPTZ` | default: CURRENT_TIMESTAMP |
| `updated_at` | `TIMESTAMPTZ` | default: CURRENT_TIMESTAMP |

### 15. student_profiles

| Thuộc tính | Kiểu | Ràng buộc / liên kết |
|---|---|---|
| `id` | `BIGSERIAL` | PK |
| `user_id` | `BIGINT` | NN; UQ; FK → users.id |
| `student_code` | `VARCHAR(30)` | NN; UQ |
| `major` | `VARCHAR(100)` | NN |
| `academic_year` | `VARCHAR(20)` |  |
| `gpa` | `NUMERIC(3, 2)` |  |
| `passed_credits` | `INT` |  |
| `cv_file_url` | `TEXT` |  |
| `portfolio_url` | `TEXT` |  |
| `github_url` | `TEXT` |  |
| `linkedin_url` | `TEXT` |  |
| `bio_summary` | `TEXT` |  |
| `preferred_province_id` | `BIGINT` | FK → provinces.id |
| `desired_position` | `VARCHAR(150)` |  |
| `preferred_work_format` | `VARCHAR(30)` | default: 'ANY' |
| `data_sharing_consent` | `BOOLEAN` | default: TRUE |
| `internship_status` | `VARCHAR(30)` | default: 'NOT_STARTED' |
| `embedding` | `vector(768)` |  |
| `updated_at` | `TIMESTAMPTZ` | default: CURRENT_TIMESTAMP |

### 16. student_skills

| Thuộc tính | Kiểu | Ràng buộc / liên kết |
|---|---|---|
| `student_profile_id` | `BIGINT` | NN; FK → student_profiles.id |
| `skill_id` | `VARCHAR(50)` | NN; FK → skills.id |
| `proficiency_level` | `VARCHAR(20)` | default: 'BEGINNER' |
| `years_experience` | `NUMERIC(3, 1)` | default: 0 |
| `verified_by_exam` | `BOOLEAN` | default: FALSE |

### 17. student_courses

| Thuộc tính | Kiểu | Ràng buộc / liên kết |
|---|---|---|
| `id` | `BIGSERIAL` | PK |
| `student_profile_id` | `BIGINT` | NN; FK → student_profiles.id |
| `course_code` | `VARCHAR(30)` | NN |
| `course_name` | `VARCHAR(150)` | NN |
| `grade` | `NUMERIC(3, 2)` |  |
| `credits` | `INT` | default: 3 |
| `semester` | `VARCHAR(30)` |  |

### 18. student_certificates

| Thuộc tính | Kiểu | Ràng buộc / liên kết |
|---|---|---|
| `id` | `BIGSERIAL` | PK |
| `student_profile_id` | `BIGINT` | NN; FK → student_profiles.id |
| `certificate_name` | `VARCHAR(150)` | NN |
| `issuing_organization` | `VARCHAR(150)` |  |
| `issue_date` | `DATE` |  |
| `certificate_url` | `TEXT` |  |

### 19. curriculum_vitaes

| Thuộc tính | Kiểu | Ràng buộc / liên kết |
|---|---|---|
| `id` | `BIGSERIAL` | PK |
| `student_profile_id` | `BIGINT` | NN; FK → student_profiles.id |
| `file_name` | `VARCHAR(255)` | NN |
| `file_url` | `TEXT` | NN |
| `parsed_text` | `TEXT` |  |
| `is_default` | `BOOLEAN` | default: FALSE |
| `created_at` | `TIMESTAMPTZ` | default: CURRENT_TIMESTAMP |

### 20. cv_analysis

| Thuộc tính | Kiểu | Ràng buộc / liên kết |
|---|---|---|
| `id` | `BIGSERIAL` | PK |
| `cv_id` | `BIGINT` | NN; UQ; FK → curriculum_vitaes.id |
| `extracted_skills` | `JSONB` |  |
| `education_info` | `TEXT` |  |
| `experience_info` | `TEXT` |  |
| `ai_score` | `DOUBLE PRECISION` |  |
| `model_name` | `VARCHAR(100)` |  |
| `created_at` | `TIMESTAMPTZ` | default: CURRENT_TIMESTAMP |

### 21. internship_terms

| Thuộc tính | Kiểu | Ràng buộc / liên kết |
|---|---|---|
| `id` | `BIGSERIAL` | PK |
| `name` | `VARCHAR(150)` | NN |
| `academic_year` | `VARCHAR(30)` | NN |
| `semester` | `INT` | NN |
| `department_id` | `BIGINT` | FK → departments.id |
| `registration_start_date` | `DATE` | NN |
| `registration_deadline` | `DATE` | NN |
| `internship_start_date` | `DATE` | NN |
| `internship_end_date` | `DATE` | NN |
| `max_credits` | `INT` | default: 10 |
| `status` | `VARCHAR(30)` | default: 'OPEN' |
| `created_at` | `TIMESTAMPTZ` | default: CURRENT_TIMESTAMP |

### 22. term_student_registrations

| Thuộc tính | Kiểu | Ràng buộc / liên kết |
|---|---|---|
| `id` | `BIGSERIAL` | PK |
| `internship_term_id` | `BIGINT` | NN; FK → internship_terms.id |
| `student_profile_id` | `BIGINT` | NN; FK → student_profiles.id |
| `course_class_code` | `VARCHAR(50)` |  |
| `is_eligible` | `BOOLEAN` | default: TRUE |
| `imported_at` | `TIMESTAMPTZ` | default: CURRENT_TIMESTAMP |

### 23. supervisor_assignments

| Thuộc tính | Kiểu | Ràng buộc / liên kết |
|---|---|---|
| `id` | `BIGSERIAL` | PK |
| `internship_term_id` | `BIGINT` | NN; FK → internship_terms.id |
| `student_profile_id` | `BIGINT` | NN; FK → student_profiles.id |
| `lecturer_user_id` | `BIGINT` | NN; FK → users.id |
| `assigned_by_user_id` | `BIGINT` | FK → users.id |
| `assigned_date` | `DATE` | default: CURRENT_DATE |
| `status` | `VARCHAR(30)` | default: 'ACTIVE' |

### 24. assignment_histories

| Thuộc tính | Kiểu | Ràng buộc / liên kết |
|---|---|---|
| `id` | `BIGSERIAL` | PK |
| `assignment_id` | `BIGINT` | NN; FK → supervisor_assignments.id |
| `previous_lecturer_id` | `BIGINT` | NN; FK → users.id |
| `new_lecturer_id` | `BIGINT` | NN; FK → users.id |
| `changed_by_user_id` | `BIGINT` | NN; FK → users.id |
| `reason` | `TEXT` | NN |
| `changed_at` | `TIMESTAMPTZ` | default: CURRENT_TIMESTAMP |

### 25. applications

| Thuộc tính | Kiểu | Ràng buộc / liên kết |
|---|---|---|
| `id` | `BIGSERIAL` | PK |
| `student_profile_id` | `BIGINT` | NN; FK → student_profiles.id |
| `job_id` | `BIGINT` | NN; FK → jobs.id |
| `cover_letter` | `TEXT` |  |
| `ai_match_score` | `NUMERIC(5, 2)` |  |
| `status` | `VARCHAR(30)` | default: 'APPLIED' |
| `offer_details` | `TEXT` |  |
| `offer_deadline` | `TIMESTAMPTZ` |  |
| `student_decision_at` | `TIMESTAMPTZ` |  |
| `applied_at` | `TIMESTAMPTZ` | default: CURRENT_TIMESTAMP |
| `updated_at` | `TIMESTAMPTZ` | default: CURRENT_TIMESTAMP |

### 26. matching_results

| Thuộc tính | Kiểu | Ràng buộc / liên kết |
|---|---|---|
| `id` | `BIGSERIAL` | PK |
| `job_id` | `BIGINT` | NN; FK → jobs.id |
| `student_profile_id` | `BIGINT` | NN; FK → student_profiles.id |
| `skill_score` | `NUMERIC(5, 4)` |  |
| `semantic_score` | `NUMERIC(5, 4)` |  |
| `academic_score` | `NUMERIC(5, 4)` |  |
| `overall_score` | `NUMERIC(5, 4)` |  |
| `match_percentage` | `NUMERIC(5, 2)` |  |
| `matched_skills` | `JSONB` |  |
| `missing_skills` | `JSONB` |  |
| `recommendation` | `TEXT` |  |
| `calculated_at` | `TIMESTAMPTZ` | default: CURRENT_TIMESTAMP |

### 27. interviews

| Thuộc tính | Kiểu | Ràng buộc / liên kết |
|---|---|---|
| `id` | `BIGSERIAL` | PK |
| `application_id` | `BIGINT` | NN; FK → applications.id |
| `created_by_user_id` | `BIGINT` | NN; FK → users.id |
| `title` | `VARCHAR(200)` | NN |
| `interview_type` | `VARCHAR(50)` | default: 'ONLINE' |
| `scheduled_start` | `TIMESTAMPTZ` | NN |
| `scheduled_end` | `TIMESTAMPTZ` |  |
| `meeting_url` | `VARCHAR(500)` |  |
| `location_details` | `TEXT` |  |
| `notes` | `TEXT` |  |
| `status` | `VARCHAR(30)` | default: 'SCHEDULED' |
| `created_at` | `TIMESTAMPTZ` | default: CURRENT_TIMESTAMP |

### 28. interview_participants

| Thuộc tính | Kiểu | Ràng buộc / liên kết |
|---|---|---|
| `id` | `BIGSERIAL` | PK |
| `interview_id` | `BIGINT` | NN; FK → interviews.id |
| `user_id` | `BIGINT` | NN; FK → users.id |
| `participant_role` | `VARCHAR(50)` | default: 'INTERVIEWER' |
| `joined_at` | `TIMESTAMPTZ` |  |
| `status` | `VARCHAR(30)` | default: 'INVITED' |

### 29. learning_agreements

| Thuộc tính | Kiểu | Ràng buộc / liên kết |
|---|---|---|
| `id` | `BIGSERIAL` | PK |
| `internship_term_id` | `BIGINT` | FK → internship_terms.id |
| `application_id` | `BIGINT` | NN; UQ; FK → applications.id |
| `student_id` | `BIGINT` | NN; FK → users.id |
| `academic_supervisor_id` | `BIGINT` | NN; FK → users.id |
| `company_mentor_id` | `BIGINT` | NN; FK → users.id |
| `educational_objectives` | `TEXT` | NN |
| `detailed_tasks` | `TEXT` | NN |
| `knowledge_skills_to_acquire` | `TEXT` |  |
| `confidentiality_agreed` | `BOOLEAN` | default: TRUE |
| `work_hours_per_week` | `INT` | default: 40 |
| `start_date` | `DATE` | NN |
| `end_date` | `DATE` | NN |
| `version` | `INT` | default: 1 |
| `status` | `VARCHAR(30)` | default: 'DRAFT' |
| `student_signed` | `BOOLEAN` | default: FALSE |
| `student_signed_at` | `TIMESTAMPTZ` |  |
| `mentor_signed` | `BOOLEAN` | default: FALSE |
| `mentor_signed_at` | `TIMESTAMPTZ` |  |
| `supervisor_signed` | `BOOLEAN` | default: FALSE |
| `supervisor_signed_at` | `TIMESTAMPTZ` |  |
| `transferred_from_agreement_id` | `BIGINT` | FK → learning_agreements.id |
| `transferred_sessions_credited` | `INT` | default: 0 |
| `transferred_hours_credited` | `NUMERIC(5, 2)` | default: 0.0 |
| `min_weeks_required` | `INT` | default: 4 |
| `created_at` | `TIMESTAMPTZ` | default: CURRENT_TIMESTAMP |
| `updated_at` | `TIMESTAMPTZ` | default: CURRENT_TIMESTAMP |

### 30. agreement_amendments

| Thuộc tính | Kiểu | Ràng buộc / liên kết |
|---|---|---|
| `id` | `BIGSERIAL` | PK |
| `learning_agreement_id` | `BIGINT` | NN; FK → learning_agreements.id |
| `version_number` | `INT` | NN |
| `reason_for_change` | `TEXT` | NN |
| `changes_summary` | `JSONB` | NN |
| `approved_by_student` | `BOOLEAN` | default: FALSE |
| `approved_by_mentor` | `BOOLEAN` | default: FALSE |
| `approved_by_supervisor` | `BOOLEAN` | default: FALSE |
| `amended_at` | `TIMESTAMPTZ` | default: CURRENT_TIMESTAMP |

### 31. internship_work_schedules

| Thuộc tính | Kiểu | Ràng buộc / liên kết |
|---|---|---|
| `id` | `BIGSERIAL` | PK |
| `learning_agreement_id` | `BIGINT` | NN; FK → learning_agreements.id |
| `day_of_week` | `INT` | NN |
| `session_number` | `INT` | NN |
| `start_time` | `TIME` | NN |
| `end_time` | `TIME` | NN |
| `work_format` | `VARCHAR(20)` | NN; default: 'ONSITE' |
| `version` | `INT` | NN; default: 1 |
| `is_active` | `BOOLEAN` | NN; default: TRUE |
| `effective_from` | `DATE` |  |
| `effective_to` | `DATE` |  |
| `created_at` | `TIMESTAMPTZ` | default: CURRENT_TIMESTAMP |

### 32. internship_schedule_proposals

| Thuộc tính | Kiểu | Ràng buộc / liên kết |
|---|---|---|
| `id` | `BIGSERIAL` | PK |
| `learning_agreement_id` | `BIGINT` | NN; FK → learning_agreements.id |
| `proposal_type` | `VARCHAR(20)` | NN |
| `status` | `VARCHAR(30)` | NN; default: 'PENDING_MENTOR' |
| `reason` | `TEXT` | NN |
| `effective_date` | `DATE` | NN |
| `proposed_by_user_id` | `BIGINT` | NN; FK → users.id |
| `schedule_items_json` | `TEXT` | NN |
| `reviewed_by_user_id` | `BIGINT` | FK → users.id |
| `feedback` | `TEXT` |  |
| `created_at` | `TIMESTAMPTZ` | default: CURRENT_TIMESTAMP |
| `updated_at` | `TIMESTAMPTZ` | default: CURRENT_TIMESTAMP |

### 33. internship_transfer_requests

| Thuộc tính | Kiểu | Ràng buộc / liên kết |
|---|---|---|
| `id` | `BIGSERIAL` | PK |
| `learning_agreement_id` | `BIGINT` | NN; FK → learning_agreements.id |
| `student_id` | `BIGINT` | NN; FK → users.id |
| `old_company_id` | `BIGINT` | NN; FK → companies.id |
| `new_company_id` | `BIGINT` | FK → companies.id |
| `reason` | `TEXT` | NN |
| `status` | `VARCHAR(30)` | NN; default: 'TRANSFER_REQUESTED' |
| `retained_sessions_count` | `INT` | default: 0 |
| `retained_hours_count` | `NUMERIC(5, 2)` | default: 0.0 |
| `faculty_notes` | `TEXT` |  |
| `approved_by_user_id` | `BIGINT` | FK → users.id |
| `new_learning_agreement_id` | `BIGINT` | FK → learning_agreements.id |
| `created_at` | `TIMESTAMPTZ` | default: CURRENT_TIMESTAMP |
| `updated_at` | `TIMESTAMPTZ` | default: CURRENT_TIMESTAMP |

### 34. early_termination_requests

| Thuộc tính | Kiểu | Ràng buộc / liên kết |
|---|---|---|
| `id` | `BIGSERIAL` | PK |
| `learning_agreement_id` | `BIGINT` | NN; FK → learning_agreements.id |
| `initiated_by_user_id` | `BIGINT` | NN; FK → users.id |
| `reason` | `TEXT` | NN |
| `last_working_date` | `DATE` | NN |
| `warning_evidence_url` | `VARCHAR(500)` |  |
| `evaluation_summary` | `TEXT` |  |
| `student_response` | `TEXT` |  |
| `lecturer_verification` | `TEXT` |  |
| `faculty_decision` | `VARCHAR(30)` |  |
| `status` | `VARCHAR(30)` | NN; default: 'EARLY_TERMINATION_REQUESTED' |
| `created_at` | `TIMESTAMPTZ` | default: CURRENT_TIMESTAMP |
| `updated_at` | `TIMESTAMPTZ` | default: CURRENT_TIMESTAMP |

### 35. logbooks

| Thuộc tính | Kiểu | Ràng buộc / liên kết |
|---|---|---|
| `id` | `BIGSERIAL` | PK |
| `learning_agreement_id` | `BIGINT` | NN; FK → learning_agreements.id |
| `week_number` | `INT` | NN |
| `start_date` | `DATE` | NN |
| `end_date` | `DATE` | NN |
| `tasks_performed` | `TEXT` | NN |
| `learned_skills` | `TEXT` |  |
| `evidence_url` | `TEXT` |  |
| `hours_logged` | `NUMERIC(5, 1)` | default: 0 |
| `status` | `VARCHAR(30)` | default: 'SUBMITTED' |
| `mentor_feedback` | `TEXT` |  |
| `mentor_rating` | `INT` |  |
| `supervisor_notes` | `TEXT` |  |
| `supervisor_reviewed_at` | `TIMESTAMPTZ` |  |
| `submitted_at` | `TIMESTAMPTZ` | default: CURRENT_TIMESTAMP |

### 36. logbook_entries

| Thuộc tính | Kiểu | Ràng buộc / liên kết |
|---|---|---|
| `id` | `BIGSERIAL` | PK |
| `logbook_id` | `BIGINT` | FK → logbooks.id |
| `learning_agreement_id` | `BIGINT` | NN; FK → learning_agreements.id |
| `work_date` | `DATE` | NN |
| `session_number` | `INT` | NN |
| `tasks_performed` | `TEXT` | NN |
| `skills_acquired` | `TEXT` |  |
| `challenges_faced` | `TEXT` |  |
| `hours_spent` | `NUMERIC(4, 2)` | NN; default: 4.0 |
| `evidence_url` | `TEXT` |  |
| `created_at` | `TIMESTAMPTZ` | default: CURRENT_TIMESTAMP |
| `updated_at` | `TIMESTAMPTZ` | default: CURRENT_TIMESTAMP |

### 37. attendance_sessions

| Thuộc tính | Kiểu | Ràng buộc / liên kết |
|---|---|---|
| `id` | `BIGSERIAL` | PK |
| `learning_agreement_id` | `BIGINT` | NN; FK → learning_agreements.id |
| `work_date` | `DATE` | NN |
| `session_number` | `INT` | NN |
| `work_format` | `VARCHAR(20)` | NN; default: 'ONSITE' |
| `check_in_at` | `TIMESTAMPTZ` | NN |
| `check_out_at` | `TIMESTAMPTZ` |  |
| `duration_minutes` | `INT` | default: 0 |
| `logbook_entry_id` | `BIGINT` | FK → logbook_entries.id |
| `student_note` | `TEXT` |  |
| `evidence_url` | `TEXT` |  |
| `evidence_type` | `VARCHAR(50)` | default: 'TASK_LINK' |
| `mentor_status` | `VARCHAR(30)` | NN; default: 'PENDING' |
| `mentor_confirmed_at` | `TIMESTAMPTZ` |  |
| `mentor_feedback` | `TEXT` |  |
| `is_make_up` | `BOOLEAN` | default: FALSE |
| `make_up_for_date` | `DATE` |  |
| `is_offline_recorded` | `BOOLEAN` | NN; default: FALSE |
| `client_recorded_at` | `TIMESTAMPTZ` |  |
| `server_received_at` | `TIMESTAMPTZ` |  |
| `is_locked` | `BOOLEAN` | NN; default: FALSE |
| `locked_at` | `TIMESTAMPTZ` |  |
| `created_at` | `TIMESTAMPTZ` | default: CURRENT_TIMESTAMP |
| `updated_at` | `TIMESTAMPTZ` | default: CURRENT_TIMESTAMP |

### 38. attendance_correction_requests

| Thuộc tính | Kiểu | Ràng buộc / liên kết |
|---|---|---|
| `id` | `BIGSERIAL` | PK |
| `attendance_session_id` | `BIGINT` | FK → attendance_sessions.id |
| `learning_agreement_id` | `BIGINT` | NN; FK → learning_agreements.id |
| `student_id` | `BIGINT` | NN; FK → users.id |
| `work_date` | `DATE` | NN |
| `session_number` | `INT` | NN |
| `requested_check_in_at` | `TIMESTAMPTZ` |  |
| `requested_check_out_at` | `TIMESTAMPTZ` |  |
| `requested_duration_minutes` | `INT` |  |
| `requested_work_format` | `VARCHAR(20)` |  |
| `tasks_performed` | `TEXT` |  |
| `skills_acquired` | `TEXT` |  |
| `challenges_faced` | `TEXT` |  |
| `hours_spent` | `DOUBLE PRECISION` |  |
| `evidence_url` | `TEXT` |  |
| `evidence_type` | `VARCHAR(50)` |  |
| `reason_for_correction` | `TEXT` | NN |
| `status` | `VARCHAR(30)` | NN; default: 'PENDING' |
| `reviewed_by_user_id` | `BIGINT` | FK → users.id |
| `reviewed_at` | `TIMESTAMPTZ` |  |
| `mentor_feedback` | `TEXT` |  |
| `created_at` | `TIMESTAMPTZ` | default: CURRENT_TIMESTAMP |
| `updated_at` | `TIMESTAMPTZ` | default: CURRENT_TIMESTAMP |

### 39. attendance_disputes

| Thuộc tính | Kiểu | Ràng buộc / liên kết |
|---|---|---|
| `id` | `BIGSERIAL` | PK |
| `attendance_session_id` | `BIGINT` | NN; FK → attendance_sessions.id |
| `learning_agreement_id` | `BIGINT` | NN; FK → learning_agreements.id |
| `student_id` | `BIGINT` | NN; FK → users.id |
| `dispute_reason` | `TEXT` | NN |
| `evidence_url` | `VARCHAR(500)` |  |
| `mentor_response` | `TEXT` |  |
| `supervisor_proposal` | `TEXT` |  |
| `faculty_decision` | `TEXT` |  |
| `tier_level` | `INT` | NN; default: 1 |
| `status` | `VARCHAR(30)` | NN; default: 'OPEN' |
| `created_at` | `TIMESTAMPTZ` | default: CURRENT_TIMESTAMP |
| `resolved_at` | `TIMESTAMPTZ` |  |

### 40. attendance_audit_logs

| Thuộc tính | Kiểu | Ràng buộc / liên kết |
|---|---|---|
| `id` | `BIGSERIAL` | PK |
| `attendance_session_id` | `BIGINT` | NN; FK → attendance_sessions.id |
| `action_type` | `VARCHAR(30)` | NN |
| `field_name` | `VARCHAR(50)` |  |
| `old_value` | `TEXT` |  |
| `new_value` | `TEXT` |  |
| `change_reason` | `TEXT` |  |
| `changed_by_user_id` | `BIGINT` | NN; FK → users.id |
| `created_at` | `TIMESTAMPTZ` | default: CURRENT_TIMESTAMP |

### 41. internship_exceptions

| Thuộc tính | Kiểu | Ràng buộc / liên kết |
|---|---|---|
| `id` | `BIGSERIAL` | PK |
| `learning_agreement_id` | `BIGINT` | NN; FK → learning_agreements.id |
| `week_number` | `INT` | NN |
| `exception_type` | `VARCHAR(40)` | NN |
| `exempt_sessions_count` | `INT` | NN; default: 1 |
| `start_date` | `DATE` | NN |
| `end_date` | `DATE` | NN |
| `reason` | `TEXT` | NN |
| `evidence_url` | `TEXT` |  |
| `status` | `VARCHAR(30)` | NN; default: 'PENDING_FACULTY' |
| `proposed_by_user_id` | `BIGINT` | NN; FK → users.id |
| `proposed_by_role` | `VARCHAR(30)` | NN |
| `approved_by_user_id` | `BIGINT` | FK → users.id |
| `approved_at` | `TIMESTAMPTZ` |  |
| `faculty_note` | `TEXT` |  |
| `created_at` | `TIMESTAMPTZ` | default: CURRENT_TIMESTAMP |

### 42. internship_incidents

| Thuộc tính | Kiểu | Ràng buộc / liên kết |
|---|---|---|
| `id` | `BIGSERIAL` | PK |
| `learning_agreement_id` | `BIGINT` | NN; FK → learning_agreements.id |
| `reported_by_user_id` | `BIGINT` | NN; FK → users.id |
| `incident_type` | `VARCHAR(50)` | NN |
| `description` | `TEXT` | NN |
| `student_explanation` | `TEXT` |  |
| `student_evidence_url` | `TEXT` |  |
| `severity` | `VARCHAR(20)` | default: 'MEDIUM' |
| `resolution_status` | `VARCHAR(30)` | default: 'OPEN' |
| `resolution_notes` | `TEXT` |  |
| `resolved_by_user_id` | `BIGINT` | FK → users.id |
| `reported_at` | `TIMESTAMPTZ` | default: CURRENT_TIMESTAMP |
| `resolved_at` | `TIMESTAMPTZ` |  |

### 43. weekly_compliance_records

| Thuộc tính | Kiểu | Ràng buộc / liên kết |
|---|---|---|
| `id` | `BIGSERIAL` | PK |
| `learning_agreement_id` | `BIGINT` | NN; FK → learning_agreements.id |
| `week_number` | `INT` | NN |
| `start_date` | `DATE` | NN |
| `end_date` | `DATE` | NN |
| `required_sessions` | `INT` | NN; default: 6 |
| `confirmed_sessions` | `INT` | NN; default: 0 |
| `make_up_sessions` | `INT` | NN; default: 0 |
| `exempt_sessions` | `INT` | NN; default: 0 |
| `status` | `VARCHAR(30)` | NN; default: 'IN_PROGRESS' |
| `make_up_deadline` | `DATE` |  |
| `consecutive_failed_weeks` | `INT` | NN; default: 0 |
| `incident_id` | `BIGINT` | FK → internship_incidents.id |
| `evaluated_at` | `TIMESTAMPTZ` |  |
| `created_at` | `TIMESTAMPTZ` | default: CURRENT_TIMESTAMP |
| `updated_at` | `TIMESTAMPTZ` | default: CURRENT_TIMESTAMP |

### 44. nace_competencies

| Thuộc tính | Kiểu | Ràng buộc / liên kết |
|---|---|---|
| `code` | `VARCHAR(30)` | PK |
| `name` | `VARCHAR(100)` | NN |
| `description` | `TEXT` |  |

### 45. rubric_evaluations

| Thuộc tính | Kiểu | Ràng buộc / liên kết |
|---|---|---|
| `id` | `BIGSERIAL` | PK |
| `learning_agreement_id` | `BIGINT` | NN; FK → learning_agreements.id |
| `evaluation_type` | `VARCHAR(20)` | NN |
| `evaluator_role` | `VARCHAR(30)` | NN |
| `evaluator_user_id` | `BIGINT` | NN; FK → users.id |
| `total_score` | `NUMERIC(4, 2)` |  |
| `strengths_observed` | `TEXT` |  |
| `areas_for_improvement` | `TEXT` |  |
| `future_recommendations` | `TEXT` |  |
| `evaluated_at` | `TIMESTAMPTZ` | default: CURRENT_TIMESTAMP |

### 46. rubric_criteria_scores

| Thuộc tính | Kiểu | Ràng buộc / liên kết |
|---|---|---|
| `id` | `BIGSERIAL` | PK |
| `evaluation_id` | `BIGINT` | NN; FK → rubric_evaluations.id |
| `competency_code` | `VARCHAR(30)` | NN; FK → nace_competencies.code |
| `score` | `NUMERIC(3, 1)` | NN |
| `behavioral_evidence` | `TEXT` |  |

### 47. internship_appeals

| Thuộc tính | Kiểu | Ràng buộc / liên kết |
|---|---|---|
| `id` | `BIGSERIAL` | PK |
| `learning_agreement_id` | `BIGINT` | NN; FK → learning_agreements.id |
| `student_user_id` | `BIGINT` | NN; FK → users.id |
| `appeal_type` | `VARCHAR(50)` | NN |
| `title` | `VARCHAR(255)` | NN |
| `content` | `TEXT` | NN |
| `evidence_url` | `TEXT` |  |
| `status` | `VARCHAR(30)` | default: 'PENDING' |
| `response_content` | `TEXT` |  |
| `handled_by_user_id` | `BIGINT` | FK → users.id |
| `created_at` | `TIMESTAMPTZ` | default: CURRENT_TIMESTAMP |
| `resolved_at` | `TIMESTAMPTZ` |  |

### 48. notifications

| Thuộc tính | Kiểu | Ràng buộc / liên kết |
|---|---|---|
| `id` | `BIGSERIAL` | PK |
| `user_id` | `BIGINT` | NN; FK → users.id |
| `title` | `VARCHAR(200)` | NN |
| `content` | `TEXT` | NN |
| `type` | `VARCHAR(50)` | default: 'GENERAL' |
| `is_read` | `BOOLEAN` | default: FALSE |
| `action_url` | `VARCHAR(500)` |  |
| `created_at` | `TIMESTAMPTZ` | default: CURRENT_TIMESTAMP |

### 49. satisfaction_surveys

| Thuộc tính | Kiểu | Ràng buộc / liên kết |
|---|---|---|
| `id` | `BIGSERIAL` | PK |
| `learning_agreement_id` | `BIGINT` | NN; FK → learning_agreements.id |
| `submitted_by_user_id` | `BIGINT` | NN; FK → users.id |
| `target_type` | `VARCHAR(50)` | NN |
| `satisfaction_score` | `INT` | NN |
| `work_environment_rating` | `INT` |  |
| `mentor_support_rating` | `INT` |  |
| `would_recommend` | `BOOLEAN` | default: TRUE |
| `comments` | `TEXT` |  |
| `created_at` | `TIMESTAMPTZ` | default: CURRENT_TIMESTAMP |

## B. Bảng kỹ thuật

### 50. flyway_schema_history

| Thuộc tính | Ý nghĩa |
|---|---|
| `installed_rank` | Thứ tự migration, PK |
| `version` | Phiên bản migration |
| `description` | Mô tả |
| `type` | Loại migration |
| `script` | Tên script |
| `checksum` | Checksum |
| `installed_by` | Người chạy |
| `installed_on` | Thời điểm chạy |
| `execution_time` | Thời gian thực thi |
| `success` | Kết quả |

Bảng này không có liên kết nghiệp vụ và nên đặt ngoài system boundary trên ERD.

## C. Danh sách liên kết và cardinality

Ký pháp: multiplicity cạnh thực thể cha là số cha mà một bản ghi con có thể tham chiếu; multiplicity cạnh thực thể con là số bản ghi con mà một cha có thể sở hữu. Tên liên kết trong bảng được đọc theo chiều **thực thể con → thực thể cha**. Ví dụ `company_verifications` “thuộc doanh nghiệp” `companies`.

| # | Thực thể cha | Tên liên kết | Thực thể con | Cardinality | FK |
|---:|---|---|---|---|---|
| 1 | `provinces` | thuộc tỉnh/thành | `districts` | `provinces [1] — districts [0..N]` | `districts.province_id` |
| 2 | `districts` | thuộc quận/huyện | `wards` | `districts [1] — wards [0..N]` | `wards.district_id` |
| 3 | `wards` | thuộc phường/xã | `addresses` | `wards [0..1] — addresses [0..N]` | `addresses.ward_id` |
| 4 | `addresses` | đặt tại địa chỉ | `universities` | `addresses [0..1] — universities [0..N]` | `universities.address_id` |
| 5 | `universities` | trực thuộc trường | `departments` | `universities [1] — departments [0..N]` | `departments.university_id` |
| 6 | `departments` | thuộc Khoa | `users` | `departments [0..1] — users [0..N]` | `users.department_id` |
| 7 | `addresses` | đặt tại địa chỉ | `companies` | `addresses [0..1] — companies [0..N]` | `companies.address_id` |
| 8 | `users` | được tạo bởi | `companies` | `users [0..1] — companies [0..N]` | `companies.created_by_user_id` |
| 9 | `companies` | thuộc doanh nghiệp | `company_verifications` | `companies [1] — company_verifications [0..N]` | `company_verifications.company_id` |
| 10 | `users` | được duyệt bởi | `company_verifications` | `users [1] — company_verifications [0..N]` | `company_verifications.reviewed_by_faculty_id` |
| 11 | `departments` | thuộc Khoa | `department_company_partnerships` | `departments [1] — department_company_partnerships [0..N]` | `department_company_partnerships.department_id` |
| 12 | `companies` | thuộc doanh nghiệp | `department_company_partnerships` | `companies [1] — department_company_partnerships [0..N]` | `department_company_partnerships.company_id` |
| 13 | `users` | được phê duyệt bởi | `department_company_partnerships` | `users [0..1] — department_company_partnerships [0..N]` | `department_company_partnerships.approved_by_user_id` |
| 14 | `companies` | thuộc doanh nghiệp | `jobs` | `companies [1] — jobs [0..N]` | `jobs.company_id` |
| 15 | `departments` | thuộc Khoa | `jobs` | `departments [0..1] — jobs [0..N]` | `jobs.department_id` |
| 16 | `addresses` | đặt tại địa chỉ | `jobs` | `addresses [0..1] — jobs [0..N]` | `jobs.address_id` |
| 17 | `users` | được phê duyệt bởi | `jobs` | `users [0..1] — jobs [0..N]` | `jobs.approved_by_user_id` |
| 18 | `jobs` | thuộc vị trí | `job_skills` | `jobs [1] — job_skills [0..N]` | `job_skills.job_id` |
| 19 | `skills` | tham chiếu kỹ năng | `job_skills` | `skills [1] — job_skills [0..N]` | `job_skills.skill_id` |
| 20 | `departments` | thuộc Khoa | `student_rosters` | `departments [1] — student_rosters [0..N]` | `student_rosters.department_id` |
| 21 | `users` | được kích hoạt bởi | `student_rosters` | `users [0..1] — student_rosters [0..N]` | `student_rosters.claimed_user_id` |
| 22 | `users` | thuộc người dùng | `student_profiles` | `users [1] — student_profiles [0..1]` | `student_profiles.user_id` |
| 23 | `provinces` | liên kết qua preferred_province_id | `student_profiles` | `provinces [0..1] — student_profiles [0..N]` | `student_profiles.preferred_province_id` |
| 24 | `student_profiles` | thuộc sinh viên | `student_skills` | `student_profiles [1] — student_skills [0..N]` | `student_skills.student_profile_id` |
| 25 | `skills` | tham chiếu kỹ năng | `student_skills` | `skills [1] — student_skills [0..N]` | `student_skills.skill_id` |
| 26 | `student_profiles` | thuộc sinh viên | `student_courses` | `student_profiles [1] — student_courses [0..N]` | `student_courses.student_profile_id` |
| 27 | `student_profiles` | thuộc sinh viên | `student_certificates` | `student_profiles [1] — student_certificates [0..N]` | `student_certificates.student_profile_id` |
| 28 | `student_profiles` | thuộc sinh viên | `curriculum_vitaes` | `student_profiles [1] — curriculum_vitaes [0..N]` | `curriculum_vitaes.student_profile_id` |
| 29 | `curriculum_vitaes` | liên kết qua cv_id | `cv_analysis` | `curriculum_vitaes [1] — cv_analysis [0..1]` | `cv_analysis.cv_id` |
| 30 | `departments` | thuộc Khoa | `internship_terms` | `departments [0..1] — internship_terms [0..N]` | `internship_terms.department_id` |
| 31 | `internship_terms` | thuộc kỳ thực tập | `term_student_registrations` | `internship_terms [1] — term_student_registrations [0..N]` | `term_student_registrations.internship_term_id` |
| 32 | `student_profiles` | thuộc sinh viên | `term_student_registrations` | `student_profiles [1] — term_student_registrations [0..N]` | `term_student_registrations.student_profile_id` |
| 33 | `internship_terms` | thuộc kỳ thực tập | `supervisor_assignments` | `internship_terms [1] — supervisor_assignments [0..N]` | `supervisor_assignments.internship_term_id` |
| 34 | `student_profiles` | thuộc sinh viên | `supervisor_assignments` | `student_profiles [1] — supervisor_assignments [0..N]` | `supervisor_assignments.student_profile_id` |
| 35 | `users` | liên kết qua lecturer_user_id | `supervisor_assignments` | `users [1] — supervisor_assignments [0..N]` | `supervisor_assignments.lecturer_user_id` |
| 36 | `users` | được phân công bởi | `supervisor_assignments` | `users [0..1] — supervisor_assignments [0..N]` | `supervisor_assignments.assigned_by_user_id` |
| 37 | `supervisor_assignments` | thuộc phân công | `assignment_histories` | `supervisor_assignments [1] — assignment_histories [0..N]` | `assignment_histories.assignment_id` |
| 38 | `users` | có GVHD trước | `assignment_histories` | `users [1] — assignment_histories [0..N]` | `assignment_histories.previous_lecturer_id` |
| 39 | `users` | có GVHD mới | `assignment_histories` | `users [1] — assignment_histories [0..N]` | `assignment_histories.new_lecturer_id` |
| 40 | `users` | được thay đổi bởi | `assignment_histories` | `users [1] — assignment_histories [0..N]` | `assignment_histories.changed_by_user_id` |
| 41 | `student_profiles` | thuộc sinh viên | `applications` | `student_profiles [1] — applications [0..N]` | `applications.student_profile_id` |
| 42 | `jobs` | thuộc vị trí | `applications` | `jobs [1] — applications [0..N]` | `applications.job_id` |
| 43 | `jobs` | thuộc vị trí | `matching_results` | `jobs [1] — matching_results [0..N]` | `matching_results.job_id` |
| 44 | `student_profiles` | thuộc sinh viên | `matching_results` | `student_profiles [1] — matching_results [0..N]` | `matching_results.student_profile_id` |
| 45 | `applications` | thuộc đơn ứng tuyển | `interviews` | `applications [1] — interviews [0..N]` | `interviews.application_id` |
| 46 | `users` | được tạo bởi | `interviews` | `users [1] — interviews [0..N]` | `interviews.created_by_user_id` |
| 47 | `interviews` | thuộc buổi phỏng vấn | `interview_participants` | `interviews [1] — interview_participants [0..N]` | `interview_participants.interview_id` |
| 48 | `users` | thuộc người dùng | `interview_participants` | `users [1] — interview_participants [0..N]` | `interview_participants.user_id` |
| 49 | `internship_terms` | thuộc kỳ thực tập | `learning_agreements` | `internship_terms [0..1] — learning_agreements [0..N]` | `learning_agreements.internship_term_id` |
| 50 | `applications` | thuộc đơn ứng tuyển | `learning_agreements` | `applications [1] — learning_agreements [0..1]` | `learning_agreements.application_id` |
| 51 | `users` | thuộc sinh viên | `learning_agreements` | `users [1] — learning_agreements [0..N]` | `learning_agreements.student_id` |
| 52 | `users` | được giám sát bởi | `learning_agreements` | `users [1] — learning_agreements [0..N]` | `learning_agreements.academic_supervisor_id` |
| 53 | `users` | được hướng dẫn bởi | `learning_agreements` | `users [1] — learning_agreements [0..N]` | `learning_agreements.company_mentor_id` |
| 54 | `learning_agreements` | chuyển tiếp từ | `learning_agreements` | `learning_agreements [0..1] — learning_agreements [0..N]` | `learning_agreements.transferred_from_agreement_id` |
| 55 | `learning_agreements` | thuộc thỏa thuận | `agreement_amendments` | `learning_agreements [1] — agreement_amendments [0..N]` | `agreement_amendments.learning_agreement_id` |
| 56 | `learning_agreements` | thuộc thỏa thuận | `internship_work_schedules` | `learning_agreements [1] — internship_work_schedules [0..N]` | `internship_work_schedules.learning_agreement_id` |
| 57 | `learning_agreements` | thuộc thỏa thuận | `internship_schedule_proposals` | `learning_agreements [1] — internship_schedule_proposals [0..N]` | `internship_schedule_proposals.learning_agreement_id` |
| 58 | `users` | liên kết qua proposed_by_user_id | `internship_schedule_proposals` | `users [1] — internship_schedule_proposals [0..N]` | `internship_schedule_proposals.proposed_by_user_id` |
| 59 | `users` | được duyệt bởi | `internship_schedule_proposals` | `users [0..1] — internship_schedule_proposals [0..N]` | `internship_schedule_proposals.reviewed_by_user_id` |
| 60 | `learning_agreements` | thuộc thỏa thuận | `internship_transfer_requests` | `learning_agreements [1] — internship_transfer_requests [0..N]` | `internship_transfer_requests.learning_agreement_id` |
| 61 | `users` | thuộc sinh viên | `internship_transfer_requests` | `users [1] — internship_transfer_requests [0..N]` | `internship_transfer_requests.student_id` |
| 62 | `companies` | chuyển từ doanh nghiệp | `internship_transfer_requests` | `companies [1] — internship_transfer_requests [0..N]` | `internship_transfer_requests.old_company_id` |
| 63 | `companies` | chuyển đến doanh nghiệp | `internship_transfer_requests` | `companies [0..1] — internship_transfer_requests [0..N]` | `internship_transfer_requests.new_company_id` |
| 64 | `users` | được phê duyệt bởi | `internship_transfer_requests` | `users [0..1] — internship_transfer_requests [0..N]` | `internship_transfer_requests.approved_by_user_id` |
| 65 | `learning_agreements` | tạo thỏa thuận mới | `internship_transfer_requests` | `learning_agreements [0..1] — internship_transfer_requests [0..N]` | `internship_transfer_requests.new_learning_agreement_id` |
| 66 | `learning_agreements` | thuộc thỏa thuận | `early_termination_requests` | `learning_agreements [1] — early_termination_requests [0..N]` | `early_termination_requests.learning_agreement_id` |
| 67 | `users` | được khởi tạo bởi | `early_termination_requests` | `users [1] — early_termination_requests [0..N]` | `early_termination_requests.initiated_by_user_id` |
| 68 | `learning_agreements` | thuộc thỏa thuận | `logbooks` | `learning_agreements [1] — logbooks [0..N]` | `logbooks.learning_agreement_id` |
| 69 | `logbooks` | thuộc nhật ký tuần | `logbook_entries` | `logbooks [0..1] — logbook_entries [0..N]` | `logbook_entries.logbook_id` |
| 70 | `learning_agreements` | thuộc thỏa thuận | `logbook_entries` | `learning_agreements [1] — logbook_entries [0..N]` | `logbook_entries.learning_agreement_id` |
| 71 | `learning_agreements` | thuộc thỏa thuận | `attendance_sessions` | `learning_agreements [1] — attendance_sessions [0..N]` | `attendance_sessions.learning_agreement_id` |
| 72 | `logbook_entries` | thuộc nhật ký tuần | `attendance_sessions` | `logbook_entries [0..1] — attendance_sessions [0..N]` | `attendance_sessions.logbook_entry_id` |
| 73 | `attendance_sessions` | thuộc phiên chấm công | `attendance_correction_requests` | `attendance_sessions [0..1] — attendance_correction_requests [0..N]` | `attendance_correction_requests.attendance_session_id` |
| 74 | `learning_agreements` | thuộc thỏa thuận | `attendance_correction_requests` | `learning_agreements [1] — attendance_correction_requests [0..N]` | `attendance_correction_requests.learning_agreement_id` |
| 75 | `users` | thuộc sinh viên | `attendance_correction_requests` | `users [1] — attendance_correction_requests [0..N]` | `attendance_correction_requests.student_id` |
| 76 | `users` | được duyệt bởi | `attendance_correction_requests` | `users [0..1] — attendance_correction_requests [0..N]` | `attendance_correction_requests.reviewed_by_user_id` |
| 77 | `attendance_sessions` | thuộc phiên chấm công | `attendance_disputes` | `attendance_sessions [1] — attendance_disputes [0..N]` | `attendance_disputes.attendance_session_id` |
| 78 | `learning_agreements` | thuộc thỏa thuận | `attendance_disputes` | `learning_agreements [1] — attendance_disputes [0..N]` | `attendance_disputes.learning_agreement_id` |
| 79 | `users` | thuộc sinh viên | `attendance_disputes` | `users [1] — attendance_disputes [0..N]` | `attendance_disputes.student_id` |
| 80 | `attendance_sessions` | thuộc phiên chấm công | `attendance_audit_logs` | `attendance_sessions [1] — attendance_audit_logs [0..N]` | `attendance_audit_logs.attendance_session_id` |
| 81 | `users` | được thay đổi bởi | `attendance_audit_logs` | `users [1] — attendance_audit_logs [0..N]` | `attendance_audit_logs.changed_by_user_id` |
| 82 | `learning_agreements` | thuộc thỏa thuận | `internship_exceptions` | `learning_agreements [1] — internship_exceptions [0..N]` | `internship_exceptions.learning_agreement_id` |
| 83 | `users` | liên kết qua proposed_by_user_id | `internship_exceptions` | `users [1] — internship_exceptions [0..N]` | `internship_exceptions.proposed_by_user_id` |
| 84 | `users` | được phê duyệt bởi | `internship_exceptions` | `users [0..1] — internship_exceptions [0..N]` | `internship_exceptions.approved_by_user_id` |
| 85 | `learning_agreements` | thuộc thỏa thuận | `internship_incidents` | `learning_agreements [1] — internship_incidents [0..N]` | `internship_incidents.learning_agreement_id` |
| 86 | `users` | được báo cáo bởi | `internship_incidents` | `users [1] — internship_incidents [0..N]` | `internship_incidents.reported_by_user_id` |
| 87 | `users` | được xử lý bởi | `internship_incidents` | `users [0..1] — internship_incidents [0..N]` | `internship_incidents.resolved_by_user_id` |
| 88 | `learning_agreements` | thuộc thỏa thuận | `weekly_compliance_records` | `learning_agreements [1] — weekly_compliance_records [0..N]` | `weekly_compliance_records.learning_agreement_id` |
| 89 | `internship_incidents` | liên quan sự cố | `weekly_compliance_records` | `internship_incidents [0..1] — weekly_compliance_records [0..N]` | `weekly_compliance_records.incident_id` |
| 90 | `learning_agreements` | thuộc thỏa thuận | `rubric_evaluations` | `learning_agreements [1] — rubric_evaluations [0..N]` | `rubric_evaluations.learning_agreement_id` |
| 91 | `users` | được đánh giá bởi | `rubric_evaluations` | `users [1] — rubric_evaluations [0..N]` | `rubric_evaluations.evaluator_user_id` |
| 92 | `rubric_evaluations` | thuộc đánh giá | `rubric_criteria_scores` | `rubric_evaluations [1] — rubric_criteria_scores [0..N]` | `rubric_criteria_scores.evaluation_id` |
| 93 | `nace_competencies` | chấm theo năng lực | `rubric_criteria_scores` | `nace_competencies [1] — rubric_criteria_scores [0..N]` | `rubric_criteria_scores.competency_code` |
| 94 | `learning_agreements` | thuộc thỏa thuận | `internship_appeals` | `learning_agreements [1] — internship_appeals [0..N]` | `internship_appeals.learning_agreement_id` |
| 95 | `users` | thuộc sinh viên | `internship_appeals` | `users [1] — internship_appeals [0..N]` | `internship_appeals.student_user_id` |
| 96 | `users` | được xử lý bởi | `internship_appeals` | `users [0..1] — internship_appeals [0..N]` | `internship_appeals.handled_by_user_id` |
| 97 | `users` | thuộc người dùng | `notifications` | `users [1] — notifications [0..N]` | `notifications.user_id` |
| 98 | `learning_agreements` | thuộc thỏa thuận | `satisfaction_surveys` | `learning_agreements [1] — satisfaction_surveys [0..N]` | `satisfaction_surveys.learning_agreement_id` |
| 99 | `users` | được gửi bởi | `satisfaction_surveys` | `users [1] — satisfaction_surveys [0..N]` | `satisfaction_surveys.submitted_by_user_id` |

Các quan hệ N–N được triển khai qua thực thể liên kết: `department_company_partnerships`, `job_skills`, `student_skills`, `term_student_registrations`, và `interview_participants`.

## D. Phụ lục TO-BE: 6 thực thể Phase 1 từng được đề xuất

Sáu thực thể này không thuộc baseline AS-IS 50 bảng. Chỉ đưa vào sơ đồ TO-BE nếu tiếp tục chấp nhận thiết kế Phase 1.

### T1. state_history

| Thuộc tính | Kiểu | Ràng buộc / liên kết |
|---|---|---|
| `id` | `BIGSERIAL` | PK |
| `entity_type` | `VARCHAR(60)` | NN |
| `entity_id` | `BIGINT` | NN |
| `old_state` | `VARCHAR(50)` |  |
| `new_state` | `VARCHAR(50)` | NN |
| `changed_by_user_id` | `BIGINT` | FK → users.id |
| `changed_at` | `TIMESTAMPTZ` | NN; default: CURRENT_TIMESTAMP |
| `reason` | `TEXT` |  |
| `correlation_id` | `VARCHAR(100)` |  |
| `metadata` | `JSONB` | NN; default: '{}'::jsonb |

### T2. offers

| Thuộc tính | Kiểu | Ràng buộc / liên kết |
|---|---|---|
| `id` | `BIGSERIAL` | PK |
| `application_id` | `BIGINT` | NN; FK → applications.id |
| `version` | `INT` | NN; default: 1 |
| `state` | `VARCHAR(30)` | NN; default: 'DRAFT' |
| `terms` | `TEXT` |  |
| `deadline` | `TIMESTAMPTZ` |  |
| `sent_by_user_id` | `BIGINT` | FK → users.id |
| `sent_at` | `TIMESTAMPTZ` |  |
| `responded_at` | `TIMESTAMPTZ` |  |
| `response_reason` | `TEXT` |  |
| `created_by_user_id` | `BIGINT` | FK → users.id |
| `updated_by_user_id` | `BIGINT` | FK → users.id |
| `created_at` | `TIMESTAMPTZ` | NN; default: CURRENT_TIMESTAMP |
| `updated_at` | `TIMESTAMPTZ` | NN; default: CURRENT_TIMESTAMP |

### T3. internship_placements

| Thuộc tính | Kiểu | Ràng buộc / liên kết |
|---|---|---|
| `id` | `BIGSERIAL` | PK |
| `application_id` | `BIGINT` | NN; UQ; FK → applications.id |
| `accepted_offer_id` | `BIGINT` | UQ; FK → offers.id |
| `internship_term_id` | `BIGINT` | FK → internship_terms.id |
| `student_user_id` | `BIGINT` | NN; FK → users.id |
| `company_id` | `BIGINT` | NN; FK → companies.id |
| `company_mentor_id` | `BIGINT` | FK → users.id |
| `academic_supervisor_id` | `BIGINT` | FK → users.id |
| `state` | `VARCHAR(30)` | NN; default: 'CREATED' |
| `start_date` | `DATE` |  |
| `end_date` | `DATE` |  |
| `version` | `INT` | NN; default: 1 |
| `state_changed_at` | `TIMESTAMPTZ` | NN; default: CURRENT_TIMESTAMP |
| `state_changed_by_user_id` | `BIGINT` | FK → users.id |
| `created_by_user_id` | `BIGINT` | FK → users.id |
| `updated_by_user_id` | `BIGINT` | FK → users.id |
| `created_at` | `TIMESTAMPTZ` | NN; default: CURRENT_TIMESTAMP |
| `updated_at` | `TIMESTAMPTZ` | NN; default: CURRENT_TIMESTAMP |

### T4. documents

| Thuộc tính | Kiểu | Ràng buộc / liên kết |
|---|---|---|
| `id` | `BIGSERIAL` | PK |
| `owner_user_id` | `BIGINT` | NN; FK → users.id |
| `purpose` | `VARCHAR(40)` | NN |
| `state` | `VARCHAR(20)` | NN; default: 'ACTIVE' |
| `version` | `INT` | NN; default: 1 |
| `storage_key` | `TEXT` | NN |
| `original_name` | `VARCHAR(255)` | NN |
| `mime_type` | `VARCHAR(150)` |  |
| `size_bytes` | `BIGINT` |  |
| `checksum_sha256` | `VARCHAR(64)` |  |
| `source_type` | `VARCHAR(60)` |  |
| `source_id` | `BIGINT` |  |
| `created_by_user_id` | `BIGINT` | FK → users.id |
| `updated_by_user_id` | `BIGINT` | FK → users.id |
| `created_at` | `TIMESTAMPTZ` | NN; default: CURRENT_TIMESTAMP |
| `updated_at` | `TIMESTAMPTZ` | NN; default: CURRENT_TIMESTAMP |
| `OR` | `(source_type` | NN |

### T5. document_links

| Thuộc tính | Kiểu | Ràng buộc / liên kết |
|---|---|---|
| `id` | `BIGSERIAL` | PK |
| `document_id` | `BIGINT` | NN; FK → documents.id |
| `entity_type` | `VARCHAR(60)` | NN |
| `entity_id` | `BIGINT` | NN |
| `relation_type` | `VARCHAR(40)` | NN; default: 'EVIDENCE' |
| `created_by_user_id` | `BIGINT` | FK → users.id |
| `created_at` | `TIMESTAMPTZ` | NN; default: CURRENT_TIMESTAMP |

### T6. final_results

| Thuộc tính | Kiểu | Ràng buộc / liên kết |
|---|---|---|
| `id` | `BIGSERIAL` | PK |
| `internship_placement_id` | `BIGINT` | NN; FK → internship_placements.id |
| `version` | `INT` | NN; default: 1 |
| `state` | `VARCHAR(20)` | NN; default: 'DRAFT' |
| `total_score` | `NUMERIC(5, 2)` |  |
| `outcome` | `VARCHAR(30)` |  |
| `credits_awarded` | `NUMERIC(5, 2)` |  |
| `calculation_policy_version` | `VARCHAR(50)` |  |
| `rationale` | `TEXT` |  |
| `finalized_by_user_id` | `BIGINT` | FK → users.id |
| `finalized_at` | `TIMESTAMPTZ` |  |
| `published_by_user_id` | `BIGINT` | FK → users.id |
| `published_at` | `TIMESTAMPTZ` |  |
| `created_by_user_id` | `BIGINT` | FK → users.id |
| `updated_by_user_id` | `BIGINT` | FK → users.id |
| `created_at` | `TIMESTAMPTZ` | NN; default: CURRENT_TIMESTAMP |
| `updated_at` | `TIMESTAMPTZ` | NN; default: CURRENT_TIMESTAMP |
| `state` | `=` | NN |
| `state` | `<>` | NN |

