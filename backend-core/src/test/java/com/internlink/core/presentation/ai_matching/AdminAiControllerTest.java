package com.internlink.core.presentation.ai_matching;

import com.internlink.core.application.ai_matching.AdminAiService;
import com.internlink.core.presentation.ai_matching.controller.AdminAiController;
import com.internlink.core.presentation.ai_matching.dto.request.AiRetryRequest;
import com.internlink.core.presentation.ai_matching.dto.response.AdminAiResponse.Stats;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.context.junit.jupiter.SpringJUnitConfig;
import java.util.List;
import java.util.UUID;
import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

@SpringJUnitConfig(AdminAiControllerTest.Config.class)
class AdminAiControllerTest {
    @Configuration
    @EnableMethodSecurity
    static class Config {
        @Bean AdminAiService service() { return mock(AdminAiService.class); }
        @Bean AdminAiController controller(AdminAiService service) { return new AdminAiController(service); }
    }

    @Autowired AdminAiController controller;
    @Autowired AdminAiService service;

    @AfterEach
    void clearContext() { SecurityContextHolder.clearContext(); reset(service); }

    @Test
    void deniesEveryAdminAiEndpointForOtherRoles() {
        for (String role : List.of("STUDENT", "FACULTY_ADMIN", "LECTURER", "COMPANY_REP", "COMPANY_MENTOR")) {
            authenticate(role);
            assertThatThrownBy(() -> controller.stats()).isInstanceOf(AccessDeniedException.class);
            assertThatThrownBy(() -> controller.health()).isInstanceOf(AccessDeniedException.class);
            assertThatThrownBy(() -> controller.runs(null, null, null, 0, 20)).isInstanceOf(AccessDeniedException.class);
            assertThatThrownBy(() -> controller.detail(UUID.randomUUID())).isInstanceOf(AccessDeniedException.class);
            assertThatThrownBy(() -> controller.taxonomy()).isInstanceOf(AccessDeniedException.class);
            assertThatThrownBy(() -> controller.retry(UUID.randomUUID(), new AiRetryRequest("Java"))).isInstanceOf(AccessDeniedException.class);
        }
        verifyNoInteractions(service);
    }

    @Test
    void allowsAdminToReadStats() {
        authenticate("ADMIN");
        when(service.stats()).thenReturn(new Stats(1, 0, 1, 0, 0));
        assertThat(controller.stats().getData().failed()).isEqualTo(1);
    }

    private void authenticate(String role) {
        SecurityContextHolder.getContext().setAuthentication(new UsernamePasswordAuthenticationToken(
            "tester", "", List.of(new SimpleGrantedAuthority("ROLE_" + role))));
    }
}
