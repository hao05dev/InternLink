package com.internlink.core.application.system.notification;

import com.internlink.core.shared.exception.BadRequestException;
import org.junit.jupiter.api.Test;
import java.util.Map;
import static org.assertj.core.api.Assertions.*;

class EmailTemplateRendererTest {
    private final EmailTemplateRenderer renderer = new EmailTemplateRenderer();

    @Test
    void rendersAllowlistedDotVariablesAndKeepsReplacementCharactersLiteral() {
        String result = renderer.render(
                "Chào {{student.fullName}} - {{job.title}}",
                Map.of("student.fullName", "An $1", "job.title", "Java\\Backend"));
        assertThat(result).isEqualTo("Chào An $1 - Java\\Backend");
    }

    @Test
    void rejectsMissingVariables() {
        assertThatThrownBy(() -> renderer.render("Chào {{student.fullName}}", Map.of()))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("student.fullName");
    }

    @Test
    void extractsUniqueVariablesInStableOrder() {
        assertThat(renderer.variables("{{term.name}}", "{{student.name}} {{term.name}}"))
                .containsExactly("term.name", "student.name");
    }
}
