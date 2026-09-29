-- The BCrypt value used by V2 and V8 did not match the documented demo password.
-- Keep those Flyway migrations immutable and repair only accounts still using that value.
UPDATE users
SET password_hash = '$2a$10$yn83n6F7678fdKd/Zdf4y.rcBqBFz3Yld9TTebnGizDaV9a9Al8V.'
WHERE password_hash = '$2a$10$V04qPky6yVn5nff2zFkWveXlJ/z46L.G9v72xT74z7rK9n0W1WzK6'
  AND email IN (
    'admin@ctu.edu.vn',
    'faculty@ctu.edu.vn',
    'lecturer@ctu.edu.vn',
    'student@ctu.edu.vn',
    'recruiter@fpt.com',
    'mentor@fpt.com',
    'admin.cict@ctu.edu.vn',
    'qltt.cict@ctu.edu.vn',
    'gvhd.son@ctu.edu.vn',
    'b2110940@student.ctu.edu.vn',
    'tuyendung.fptct@fpt.com',
    'mentor.nam@fpt.com'
  );
