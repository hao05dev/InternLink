package com.internlink.core.application.evaluation;

import com.internlink.core.shared.exception.BadRequestException;
import org.junit.jupiter.api.Test;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import static org.assertj.core.api.Assertions.*;

class AssessmentRulesTest {
    @Test
    void acceptsDifferentOfficialComponentWeightsWithoutFixedDefault() {
        var components = List.of(
            Map.<String, Object>of("code", "HOST", "name", "Cơ sở", "assessorRole", "COMPANY_MENTOR", "weight", "0.60"),
            Map.<String, Object>of("code", "REPORT", "name", "Báo cáo", "assessorRole", "LECTURER", "weight", "0.40"));
        assertThatCode(() -> AssessmentRules.validate(components)).doesNotThrowAnyException();
    }

    @Test
    void rejectsIncompleteWeightsAndDuplicateCriteria() {
        var components = List.of(Map.<String, Object>of("code", "HOST", "name", "Cơ sở",
            "assessorRole", "COMPANY_MENTOR", "weight", "0.50"));
        assertThatThrownBy(() -> AssessmentRules.validate(components))
            .isInstanceOf(BadRequestException.class).hasMessageContaining("bằng 1");
    }

    @Test
    void calculatesRubricFromApprovedCriteriaInsteadOfClientTotal() {
        var component = Map.<String, Object>of("code", "HOST", "name", "Cơ sở", "assessorRole", "COMPANY_MENTOR",
            "weight", "1.0", "criteria", List.of(
                Map.of("code", "SKILL", "name", "Chuyên môn", "weight", "0.75"),
                Map.of("code", "DISCIPLINE", "name", "Kỷ luật", "weight", "0.25")));
        assertThat(AssessmentRules.componentScore(component, null,
            Map.of("SKILL", new BigDecimal("8.0"), "DISCIPLINE", new BigDecimal("6.0"))))
            .isEqualByComparingTo("7.5");
    }
}
