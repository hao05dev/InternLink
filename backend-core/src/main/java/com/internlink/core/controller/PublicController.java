package com.internlink.core.controller;

import com.internlink.core.client.AiServiceClient;
import com.internlink.core.entity.Job;
import com.internlink.core.entity.Skill;
import com.internlink.core.repository.JobRepository;
import com.internlink.core.repository.SkillRepository;
import com.internlink.core.repository.StudentProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/public")
@RequiredArgsConstructor
public class PublicController {

    private final JobRepository jobRepository;
    private final SkillRepository skillRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final AiServiceClient aiServiceClient;

    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> healthCheck() {
        return ResponseEntity.ok(Map.of(
                "status", "UP",
                "service", "InternLink Core Backend (Spring Boot 3)",
                "timestamp", System.currentTimeMillis()
        ));
    }

    @GetMapping("/skills")
    public ResponseEntity<List<Skill>> getAllSkills() {
        return ResponseEntity.ok(skillRepository.findAll());
    }

    @GetMapping("/jobs")
    public ResponseEntity<List<Map<String, Object>>> getApprovedJobs() {
        List<Job> jobs = jobRepository.findByStatus(Job.JobStatus.APPROVED);
        List<Map<String, Object>> result = jobs.stream().map(job -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", job.getId());
            map.put("title", job.getTitle());
            map.put("companyName", job.getCompany().getName());
            map.put("location", job.getLocation());
            map.put("stipendRange", job.getStipendRange());
            map.put("description", job.getDescription());
            map.put("mandatorySkills", job.getMandatorySkills().stream().map(Skill::getName).toList());
            map.put("optionalSkills", job.getOptionalSkills().stream().map(Skill::getName).toList());
            return map;
        }).toList();
        return ResponseEntity.ok(result);
    }

    @PostMapping("/test-ai-extract")
    public ResponseEntity<Map<String, Object>> testAiExtract(@RequestBody Map<String, String> body) {
        String text = body.getOrDefault("text", "Tuyển Thực tập sinh Java yêu cầu biết Spring Boot, Docker và cơ sở dữ liệu PostgreSQL.");
        Map<String, Object> response = aiServiceClient.extractSkills(text);
        return ResponseEntity.ok(response);
    }
}
