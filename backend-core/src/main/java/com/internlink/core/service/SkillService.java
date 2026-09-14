package com.internlink.core.service;

import com.internlink.core.dto.skill.SkillResponse;
import com.internlink.core.repository.SkillRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SkillService {

    private final SkillRepository skillRepository;

    public List<SkillResponse> getAllSkills() {
        return skillRepository.findAll().stream()
                .map(SkillResponse::fromEntity)
                .toList();
    }

    public List<SkillResponse> getSkillsByCategory(String category) {
        return skillRepository.findByCategory(category).stream()
                .map(SkillResponse::fromEntity)
                .toList();
    }

    public List<SkillResponse> searchSkills(String keyword) {
        if (keyword == null || keyword.isBlank()) {
            return getAllSkills();
        }
        return skillRepository.searchSkills(keyword.trim()).stream()
                .map(SkillResponse::fromEntity)
                .toList();
    }
}