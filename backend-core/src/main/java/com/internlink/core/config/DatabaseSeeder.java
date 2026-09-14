package com.internlink.core.config;

import com.internlink.core.entity.Role;
import com.internlink.core.entity.Skill;
import com.internlink.core.entity.User;
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
        private final PasswordEncoder passwordEncoder;

        @Override
        public void run(String... args) {
                seedSkills();
                seedUsers();
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
}