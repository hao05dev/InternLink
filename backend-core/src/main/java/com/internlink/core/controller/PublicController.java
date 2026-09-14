package com.internlink.core.controller;

import com.internlink.core.client.AiServiceClient;
import com.internlink.core.entity.Skill;
import com.internlink.core.repository.SkillRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/public")
@RequiredArgsConstructor
public class PublicController {

    private final SkillRepository skillRepository;
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

    @PostMapping("/test-ai-extract")
    public ResponseEntity<Map<String, Object>> testAiExtract(@RequestBody Map<String, String> body) {
        String text = body.getOrDefault("text", "Tuyển Thực tập sinh Java yêu cầu biết Spring Boot, Docker và cơ sở dữ liệu PostgreSQL.");
        Map<String, Object> response = aiServiceClient.extractSkills(text);
        return ResponseEntity.ok(response);
    }
}

