package com.internlink.core.config;

import com.internlink.core.entity.NaceCompetency;
import com.internlink.core.entity.Role;
import com.internlink.core.entity.Skill;
import com.internlink.core.entity.User;
import com.internlink.core.repository.NaceCompetencyRepository;
import com.internlink.core.repository.SkillRepository;
import com.internlink.core.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DatabaseSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final SkillRepository skillRepository;
    private final NaceCompetencyRepository naceCompetencyRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        seedSkills();
        seedUsers();
        seedNaceCompetencies();
    }

    private void seedSkills() {
        if (skillRepository.count() == 0) {
            log.info("Seeding initial IT skills taxonomy...");
            List<Skill> initialSkills = List.of(
                    Skill.builder().id("SK-JAVA").name("Java").category("Programming Language")
                            .synonyms("core java, java 17").build(),
                    Skill.builder().id("SK-SPRING-BOOT").name("Spring Boot").category("Backend")
                            .synonyms("spring framework, spring data jpa").build(),
                    Skill.builder().id("SK-POSTGRESQL").name("PostgreSQL").category("Database")
                            .synonyms("postgres, pgvector").build(),
                    Skill.builder().id("SK-DOCKER").name("Docker").category("DevOps")
                            .synonyms("container, docker-compose").build(),
                    Skill.builder().id("SK-REACT").name("React").category("Frontend")
                            .synonyms("reactjs, react.js").build());
            skillRepository.saveAll(initialSkills);
            log.info("Seeded {} skills.", initialSkills.size());
        }
    }

    private void seedUsers() {
        if (userRepository.count() == 0) {
            log.info("Seeding initial demo users for RBAC...");
            String defaultPassword = passwordEncoder.encode("123456");

            // 1. Admin
            userRepository.save(User.builder()
                    .email("admin@internlink.edu.vn")
                    .password(defaultPassword)
                    .fullName("Quản Trị Viên Hệ Thống")
                    .role(Role.ADMIN)
                    .isActive(true)
                    .build());

            // 2. Faculty Admin
            userRepository.save(User.builder()
                    .email("khoa.cntt@internlink.edu.vn")
                    .password(defaultPassword)
                    .fullName("Ban Chủ Nhiệm Khoa CNTT")
                    .role(Role.FACULTY_ADMIN)
                    .isActive(true)
                    .build());

            // 3. Lecturer
            userRepository.save(User.builder()
                    .email("gv.nguyenan@internlink.edu.vn")
                    .password(defaultPassword)
                    .fullName("TS. Nguyễn Văn An")
                    .role(Role.LECTURER)
                    .isActive(true)
                    .build());

            // 4. Student
            userRepository.save(User.builder()
                    .email("sinhvien.hao@internlink.edu.vn")
                    .password(defaultPassword)
                    .fullName("Lê Nguyễn Hảo (Sinh viên)")
                    .role(Role.STUDENT)
                    .isActive(true)
                    .build());

            log.info("Seeded 4 demo users successfully.");
        }
    }

    private void seedNaceCompetencies() {
        if (naceCompetencyRepository.count() == 0) {
            log.info("Seeding initial NACE career readiness competencies...");
            List<NaceCompetency> competencies = List.of(
                    NaceCompetency.builder().code("CRITICAL_THINKING").name("Tư duy phản biện & Giải quyết vấn đề")
                            .description("Phân tích thông tin và giải quyết vấn đề kỹ thuật phức tạp.").build(),
                    NaceCompetency.builder().code("COMMUNICATION").name("Giao tiếp & Truyền đạt")
                            .description("Kỹ năng lắng nghe, trình bày ý tưởng rõ ràng qua văn bản và thuyết trình.").build(),
                    NaceCompetency.builder().code("TEAMWORK").name("Làm việc nhóm & Hợp tác")
                            .description("Xây dựng mối quan hệ làm việc hiệu quả và đóng góp vào mục tiêu chung.").build(),
                    NaceCompetency.builder().code("TECHNOLOGY").name("Ứng dụng công nghệ & Chuyên môn")
                            .description("Làm chủ các công cụ, ngôn ngữ lập trình và kiến trúc hệ thống.").build(),
                    NaceCompetency.builder().code("LEADERSHIP").name("Năng lực lãnh đạo")
                            .description("Chủ động nhận trách nhiệm và tạo động lực cho các thành viên.").build(),
                    NaceCompetency.builder().code("PROFESSIONALISM").name("Tác phong nghề nghiệp & Đạo đức")
                            .description("Đúng giờ, tuân thủ kỷ luật lao động và đạo đức nghề nghiệp.").build(),
                    NaceCompetency.builder().code("CAREER_DEV").name("Phát triển bản thân & Nghề nghiệp")
                            .description("Chủ động học hỏi công nghệ mới và tiếp thu phản hồi.").build(),
                    NaceCompetency.builder().code("EQUITY_INCLUSION").name("Hòa nhập & Thích ứng môi trường")
                            .description("Tôn trọng sự đa dạng văn hóa và thích nghi tốt với môi trường.").build()
            );
            naceCompetencyRepository.saveAll(competencies);
            log.info("Seeded {} NACE competencies.", competencies.size());
        }
    }
}