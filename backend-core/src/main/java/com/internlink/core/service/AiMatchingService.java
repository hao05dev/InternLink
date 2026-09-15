package com.internlink.core.service;

import com.internlink.core.client.AiServiceClient;
import com.internlink.core.dto.ai.MatchingResponse;
import com.internlink.core.entity.*;
import com.internlink.core.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
@RequiredArgsConstructor
public class AiMatchingService {

    private final MatchingResultRepository matchingResultRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final StudentSkillRepository studentSkillRepository;
    private final JobRepository jobRepository;
    private final JobSkillRepository jobSkillRepository;
    private final CompanyRepository companyRepository;
    private final AiServiceClient aiServiceClient;

    // 1. Tính toán & Xếp hạng các vị trí thực tập phù hợp nhất cho 1 sinh viên
    @Transactional
    public List<MatchingResponse> matchJobsForStudent(Long userId) {
        StudentProfile student = studentProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("Student profile not found."));

        List<StudentSkill> studentSkills = studentSkillRepository.findByIdStudentProfileId(student.getId());
        Set<String> studentSkillIds = new HashSet<>(studentSkills.stream()
                .map(ss -> ss.getId().getSkillId().toUpperCase())
                .toList());

        List<Job> approvedJobs = jobRepository.findByStatus("APPROVED");
        List<MatchingResponse> responses = new ArrayList<>();

        for (Job job : approvedJobs) {
            List<JobSkill> jobSkills = jobSkillRepository.findByIdJobId(job.getId());
            if (jobSkills.isEmpty())
                continue;

            List<String> matched = new ArrayList<>();
            List<String> missing = new ArrayList<>();
            int mandatoryTotal = 0;
            int mandatoryMatched = 0;

            for (JobSkill js : jobSkills) {
                String skillId = js.getId().getSkillId().toUpperCase();
                String skillName = js.getSkill() != null ? js.getSkill().getName() : skillId;

                if (js.getIsMandatory()) {
                    mandatoryTotal++;
                }

                if (studentSkillIds.contains(skillId)) {
                    matched.add(skillName);
                    if (js.getIsMandatory()) {
                        mandatoryMatched++;
                    }
                } else {
                    missing.add(skillName);
                }
            }

            // Công thức tính điểm: Trọng số Kỹ năng (70%) + Điểm GPA (30%)
            double skillScore = (double) matched.size() / jobSkills.size();
            double academicScore = student.getGpa() != null ? Math.min(student.getGpa() / 4.0, 1.0) : 0.75;

            // Nếu thiếu kỹ năng bắt buộc thì bị trừ điểm penalty
            double penalty = (mandatoryTotal > 0 && mandatoryMatched < mandatoryTotal) ? 0.15 : 0.0;
            double overallScore = Math.max(0.0, (skillScore * 0.7 + academicScore * 0.3) - penalty);
            double matchPercentage = Math.round(overallScore * 1000.0) / 10.0;

            String recommendation = generateRecommendation(matched, missing, matchPercentage);

            MatchingResult result = matchingResultRepository
                    .findByJobIdAndStudentProfileId(job.getId(), student.getId())
                    .orElse(MatchingResult.builder().jobId(job.getId()).studentProfileId(student.getId()).build());

            result.setSkillScore(skillScore);
            result.setAcademicScore(academicScore);
            result.setOverallScore(overallScore);
            result.setMatchPercentage(matchPercentage);
            result.setMatchedSkills(matched);
            result.setMissingSkills(missing);
            result.setRecommendation(recommendation);

            MatchingResult saved = matchingResultRepository.save(result);

            String companyName = companyRepository.findById(job.getCompanyId())
                    .map(Company::getName).orElse("Unknown");
            responses.add(MatchingResponse.of(saved, job.getTitle(), companyName));
        }

        responses.sort((a, b) -> Double.compare(b.overallScore(), a.overallScore()));
        return responses;
    }

    private String generateRecommendation(List<String> matched, List<String> missing, double matchPercentage) {
        if (matchPercentage >= 80.0) {
            return "Hồ sơ của bạn rất phù hợp với vị trí này! Bạn đã nắm vững các kỹ năng cốt lõi: "
                    + String.join(", ", matched) + ". Hãy tự tin ứng tuyển.";
        } else if (matchPercentage >= 50.0) {
            return "Bạn đáp ứng được một phần yêu cầu. Nên trau dồi thêm: " + String.join(", ", missing)
                    + " để gia tăng cơ hội trúng tuyển.";
        } else {
            return "Vị trí này đòi hỏi nhiều kỹ năng bạn chưa khai báo (" + String.join(", ", missing)
                    + "). Bạn có thể bổ sung thêm chứng chỉ hoặc dự án thực tế.";
        }
    }
}