package com.internlink.core.controller;

import com.internlink.core.dto.skill.SkillResponse;
import com.internlink.core.service.SkillService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/public/skills")
@RequiredArgsConstructor
public class SkillController {

    private final SkillService skillService;

    @GetMapping
    public ResponseEntity<List<SkillResponse>> getAllSkills(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String search) {
        if (category != null && !category.isBlank()) {
            return ResponseEntity.ok(skillService.getSkillsByCategory(category));
        }
        if (search != null && !search.isBlank()) {
            return ResponseEntity.ok(skillService.searchSkills(search));
        }
        return ResponseEntity.ok(skillService.getAllSkills());
    }
}