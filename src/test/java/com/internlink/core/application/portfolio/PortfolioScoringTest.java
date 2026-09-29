package com.internlink.core.application.portfolio;
import com.internlink.core.domain.evaluation.AssessmentScheme;
import com.internlink.core.infrastructure.persistence.jpa.JpaAssessmentComponentScoreRepository;
import com.internlink.core.shared.exception.BadRequestException;
import org.junit.jupiter.api.Test;
import java.math.BigDecimal;
import java.util.*;
import static com.internlink.core.application.portfolio.PortfolioTestData.*;
import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;
class PortfolioScoringTest {
    @Test void approvedCriteriaDetermineAcademicScoreAndJsonNumbersRemainStable()throws Exception {
        var p=placement();p.setAssessmentScheme(AssessmentScheme.builder().status("APPROVED").components(List.of(Map.of("code","REPORT","name","Báo cáo","weight",1,"assessorRole","LECTURER","criteria",List.of(Map.of("code","A","name","Nội dung","weight",0.7),Map.of("code","B","name","Trình bày","weight",0.3))))).build());
        var form=form(p,"M04");form.setContent(Map.of("academicScores",Map.of("REPORT",Map.of("criteriaScores",Map.of("A",8,"B",9)))));
        var service=new PortfolioScoring(mock(JpaAssessmentComponentScoreRepository.class));var result=service.prepare(form);
        assertThat(PortfolioContent.number(PortfolioContent.map(result.get("scores")).get("REPORT"))).isEqualByComparingTo("8.3");
        var mapper=new com.fasterxml.jackson.databind.ObjectMapper();
        assertThat(result).isEqualTo(mapper.readValue(mapper.writeValueAsBytes(result),Map.class));
        assertThat(PortfolioContent.canonical(Map.of("scores",Map.of("A",new BigDecimal("8.0"))))).isEqualTo(PortfolioContent.canonical(Map.of("scores",Map.of("A",8.0))));
        form.setContent(Map.of("academicScores",Map.of("UNASSIGNED",Map.of("score",10))));
        assertThatThrownBy(()->service.prepare(form)).isInstanceOf(BadRequestException.class);
    }
}
