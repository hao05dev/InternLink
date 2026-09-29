package com.internlink.core.application.portfolio;

import com.internlink.core.application.evaluation.AssessmentRules;
import com.internlink.core.domain.auth.User;
import com.internlink.core.domain.evaluation.AssessmentComponentScore;
import com.internlink.core.domain.placement.*;
import com.internlink.core.infrastructure.persistence.jpa.JpaAssessmentComponentScoreRepository;
import com.internlink.core.shared.exception.BadRequestException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.*;
import static com.internlink.core.application.portfolio.PortfolioContent.*;

/** Uses the approved scheme; the ten M03 criteria do not imply academic weights. */
@Service @RequiredArgsConstructor
public class PortfolioScoring {
    private final JpaAssessmentComponentScoreRepository scores;

    public Map<String,Object> prepare(PortfolioForm form) {
        if(!Set.of("M03","M04").contains(form.getKind()))return form.getContent();
        var p=form.getPlacement();var content=new LinkedHashMap<>(form.getContent());
        var entered=map(content.get("academicScores"));
        if(p.getAssessmentScheme()==null || !Set.of("APPROVED","RETIRED").contains(p.getAssessmentScheme().getStatus())) {
            if("M04".equals(form.getKind())||!entered.isEmpty())throw new BadRequestException("Cần phương án đánh giá đã duyệt để chấm điểm học phần");
            return content;
        }
        String role="M03".equals(form.getKind())?"COMPANY_MENTOR":"LECTURER";
        var components=p.getAssessmentScheme().getComponents().stream().filter(c->role.equals(c.get("assessorRole"))).toList();
        var calculated=new LinkedHashMap<String,Object>();
        for(var c:components) {
            String code=String.valueOf(c.get("code"));
            var existing=scores.findByPlacementIdAndComponentCode(p.getId(),code);
            if(!entered.containsKey(code)) {
                if(existing.isPresent()&&"VERIFIED".equals(existing.get().getStatus())) {calculated.put(code,existing.get().getScore());continue;}
                throw new BadRequestException("Cần chấm thành phần theo phương án: "+c.get("name"));
            }
            var value=map(entered.get(code));
            var total=AssessmentRules.componentScore(c,value.get("score")==null?null:number(value.get("score")),criteria(value));
            if(existing.isPresent()&&(!"VERIFIED".equals(existing.get().getStatus())||existing.get().getScore().compareTo(total)!=0||!sameScores(existing.get().getCriteriaScores(),criteria(value))))
                throw new BadRequestException("Điểm "+c.get("name")+" đã ghi nhận; không thể sửa qua biểu mẫu");
            calculated.put(code,total);
        }
        if(entered.keySet().stream().anyMatch(code->components.stream().noneMatch(c->code.equals(c.get("code")))))throw new BadRequestException("Thành phần điểm không thuộc người chấm phiếu");
        if("M04".equals(form.getKind()))content.put("scores",calculated);
        content.put("academicTotals",calculated);
        return canonical(content);
    }

    public void record(PortfolioForm form,PortfolioRevision revision,User actor) {
        if(!Set.of("M03","M04").contains(form.getKind()))return;
        var p=form.getPlacement();var totals=map(form.getContent().get("academicTotals"));
        for(var entry:totals.entrySet()) {
            if(scores.findByPlacementIdAndComponentCode(p.getId(),entry.getKey()).isPresent())continue;
            var values=map(map(form.getContent().get("academicScores")).get(entry.getKey()));
            scores.save(AssessmentComponentScore.builder().placement(p).componentCode(entry.getKey())
                .score(number(entry.getValue())).criteriaScores(criteria(values)).source("ONLINE").status("VERIFIED")
                .portfolioRevision(revision).submittedBy(actor).verifiedBy(actor).verifiedAt(OffsetDateTime.now()).build());
        }
    }
    private Map<String,BigDecimal> criteria(Map<String,Object> values) {
        var result=new LinkedHashMap<String,BigDecimal>();map(values.get("criteriaScores")).forEach((key,value)->result.put(key,number(value)));return result;
    }
    private boolean sameScores(Map<String,BigDecimal> a,Map<String,BigDecimal> b){return a.keySet().equals(b.keySet())&&a.entrySet().stream().allMatch(e->e.getValue().compareTo(b.get(e.getKey()))==0);}
}
