package com.internlink.core.config;

import com.internlink.core.entity.*;
import com.internlink.core.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Set;

@Component
@RequiredArgsConstructor
@Slf4j
public class DatabaseSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final SkillRepository skillRepository;
    private final CompanyRepository companyRepository;
    private final JobRepository jobRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        seedSkills();
        seedUsersAndDemoData();
    }

    private void seedSkills() {
        if (skillRepository.count() == 0) {
            log.info("Seeding initial IT skills taxonomy...");
            List<Skill> initialSkills = List.of(
                Skill.builder().id("SK-JAVA").name("Java").category("Language").synonyms("core java, java 17").build(),
                Skill.builder().id("SK-SPRING-BOOT").name("Spring Boot").category("Backend").synonyms("spring, spring data, spring security").build(),
                Skill.builder().id("SK-POSTGRESQL").name("PostgreSQL").category("Database").synonyms("postgres, pgvector").build(),
                Skill.builder().id("SK-DOCKER").name("Docker").category("DevOps").synonyms("container, docker-compose").build(),
                Skill.builder().id("SK-REACT").name("React").category("Frontend").synonyms("reactjs, react.js").build(),
                Skill.builder().id("SK-NEXTJS").name("Next.js").category("Frontend").synonyms("nextjs").build(),
                Skill.builder().id("SK-GIT").name("Git").category("Tool").synonyms("github, gitlab").build(),
                Skill.builder().id("SK-TEAMWORK").name("Làm việc nhóm (Teamwork)").category("SoftSkill").synonyms("teamwork").build(),
                Skill.builder().id("SK-ENGLISH").name("Tiếng Anh chuyên ngành (English)").category("Language").synonyms("english, toeic").build()
            );
            skillRepository.saveAll(initialSkills);
            log.info("Seeded {} skills.", initialSkills.size());
        }
    }

    private void seedUsersAndDemoData() {
        if (userRepository.count() == 0) {
            log.info("Seeding demo users and initial workflow data...");

            String defaultPass = passwordEncoder.encode("123456");

            // 1. Admin
            User admin = userRepository.save(User.builder()
                    .email("admin@internlink.edu.vn")
                    .password(defaultPass)
                    .fullName("Quản trị viên Hệ thống")
                    .role(Role.ADMIN)
                    .build());

            // 2. Faculty
            User faculty = userRepository.save(User.builder()
                    .email("faculty@internlink.edu.vn")
                    .password(defaultPass)
                    .fullName("TS. Nguyễn Văn Khoa (Khoa CNTT)")
                    .role(Role.FACULTY_ADMIN)
                    .build());

            // 3. Lecturer
            User lecturer = userRepository.save(User.builder()
                    .email("giangvien@internlink.edu.vn")
                    .password(defaultPass)
                    .fullName("ThS. Trần Giảng Viên")
                    .role(Role.LECTURER)
                    .build());

            // 4. Company Rep
            User companyRep = userRepository.save(User.builder()
                    .email("hr@fpt.com")
                    .password(defaultPass)
                    .fullName("Nguyễn HR (FPT Software)")
                    .role(Role.COMPANY_REP)
                    .build());

            // 5. Student
            User studentUser = userRepository.save(User.builder()
                    .email("sinhvien@internlink.edu.vn")
                    .password(defaultPass)
                    .fullName("Lê Văn Sinh Viên")
                    .role(Role.STUDENT)
                    .build());

            // Seed Company
            Company company = companyRepository.save(Company.builder()
                    .name("FPT Software")
                    .industry("Công nghệ thông tin & Phần mềm")
                    .taxCode("0101234567")
                    .address("Khu Công Nghệ Cao, TP. Thủ Đức, TP.HCM")
                    .website("https://fptsoftware.com")
                    .description("Tập đoàn công nghệ hàng đầu Việt Nam")
                    .status(Company.VerificationStatus.VERIFIED)
                    .representative(companyRep)
                    .build());

            // Seed Job
            Skill javaSkill = skillRepository.findById("SK-JAVA").orElse(null);
            Skill springSkill = skillRepository.findById("SK-SPRING-BOOT").orElse(null);
            Skill dockerSkill = skillRepository.findById("SK-DOCKER").orElse(null);
            Skill postgresSkill = skillRepository.findById("SK-POSTGRESQL").orElse(null);

            jobRepository.save(Job.builder()
                    .company(company)
                    .title("Thực tập sinh Java Backend (Spring Boot)")
                    .description("Tham gia phát triển các dịch vụ backend ngân hàng số sử dụng Java 17, Spring Boot 3 và PostgreSQL.")
                    .targetMajor("Công nghệ Thông tin / Kỹ thuật Phần mềm")
                    .location("TP.HCM")
                    .slots(5)
                    .stipendRange("5.000.000 - 8.000.000 VNĐ")
                    .status(Job.JobStatus.APPROVED)
                    .mandatorySkills(Set.of(javaSkill, springSkill))
                    .optionalSkills(Set.of(dockerSkill, postgresSkill))
                    .build());

            // Seed Student Profile
            studentProfileRepository.save(StudentProfile.builder()
                    .user(studentUser)
                    .studentCode("20110001")
                    .major("Kỹ thuật Phần mềm")
                    .gpa(3.45)
                    .bioSummary("Sinh viên năm 4 đam mê lập trình Backend Java, đã hoàn thành môn Lập trình Web và Cơ sở dữ liệu.")
                    .skills(Set.of(javaSkill, springSkill, postgresSkill))
                    .build());

            log.info("Demo data seeding completed successfully.");
        }
    }
}
