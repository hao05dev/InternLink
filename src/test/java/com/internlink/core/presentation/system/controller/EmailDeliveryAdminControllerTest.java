package com.internlink.core.presentation.system.controller;

import com.internlink.core.application.system.notification.EmailDeliveryAdminService;
import com.internlink.core.presentation.system.controller.EmailDeliveryAdminController.Action;
import com.internlink.core.presentation.system.controller.EmailDeliveryAdminController.Controls;
import com.internlink.core.presentation.system.dto.response.EmailDeliveryResponse;
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

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.*;

@SpringJUnitConfig(EmailDeliveryAdminControllerTest.Config.class)
class EmailDeliveryAdminControllerTest {

    @Configuration
    @EnableMethodSecurity
    static class Config {
        @Bean EmailDeliveryAdminService service() { return mock(EmailDeliveryAdminService.class); }
        @Bean EmailDeliveryAdminController deliveryController(EmailDeliveryAdminService service) {
            return new EmailDeliveryAdminController(service);
        }
        @Bean EmailDeliveryStatusController statusController(EmailDeliveryAdminService service) {
            return new EmailDeliveryStatusController(service);
        }
    }

    @Autowired EmailDeliveryAdminController deliveryController;
    @Autowired EmailDeliveryStatusController statusController;
    @Autowired EmailDeliveryAdminService service;

    @AfterEach
    void clearContext() {
        SecurityContextHolder.clearContext();
        reset(service);
    }

    private void authenticate(String role) {
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(
                        "user", "pass", List.of(new SimpleGrantedAuthority("ROLE_" + role))));
    }

    @Test
    void allowsFacultyAdminToViewAndRetryDeliveries() {
        authenticate("FACULTY_ADMIN");
        UUID id = UUID.randomUUID();
        when(service.page(anyString(), anyString(), anyString(), any(), anyString(), anyInt(), anyInt()))
                .thenReturn(new EmailDeliveryResponse.Page(Collections.emptyList(), 0, 0));

        var pageResponse = deliveryController.page("", "", "", null, "", 0, 20);
        assertThat(pageResponse.isSuccess()).isTrue();

        var retryResponse = deliveryController.retry(id, new Action("Retry test", true));
        assertThat(retryResponse.isSuccess()).isTrue();
        verify(service).retry(id, true, "Retry test");

        var cancelResponse = deliveryController.cancel(id, new Action("Cancel test", false));
        assertThat(cancelResponse.isSuccess()).isTrue();
        verify(service).cancel(id, "Cancel test");
    }

    @Test
    void deniesFacultyAdminFromModifyingGlobalEmailControls() {
        authenticate("FACULTY_ADMIN");
        assertThatThrownBy(() -> deliveryController.controls(new Controls(true, 100, "Reason")))
                .isInstanceOf(AccessDeniedException.class);
        verify(service, never()).controls(anyBoolean(), anyInt(), anyString());
    }

    @Test
    void allowsAdminToModifyGlobalEmailControls() {
        authenticate("ADMIN");
        when(service.controls(true, 100, "Test"))
                .thenReturn(new EmailDeliveryResponse.Controls(true, 100, 5));

        var response = deliveryController.controls(new Controls(true, 100, "Test"));
        assertThat(response.isSuccess()).isTrue();
        assertThat(response.getData().paused()).isTrue();
    }

    @Test
    void allowsFacultyAdminAndAdminToReadDeliverySummary() {
        when(service.summary()).thenReturn(new EmailDeliveryResponse.Summary(
                true, "smtp", Map.of("PENDING", 1L), null, null));

        authenticate("FACULTY_ADMIN");
        assertThat(statusController.summary().isSuccess()).isTrue();

        authenticate("ADMIN");
        assertThat(statusController.summary().isSuccess()).isTrue();
    }

    @Test
    void deniesUnauthorizedRoles() {
        for (String role : List.of("STUDENT", "LECTURER", "COMPANY_REP", "COMPANY_MENTOR")) {
            authenticate(role);
            UUID id = UUID.randomUUID();
            assertThatThrownBy(() -> deliveryController.page("", "", "", null, "", 0, 20))
                    .isInstanceOf(AccessDeniedException.class);
            assertThatThrownBy(() -> deliveryController.retry(id, new Action("test", true)))
                    .isInstanceOf(AccessDeniedException.class);
            assertThatThrownBy(() -> deliveryController.cancel(id, new Action("test", false)))
                    .isInstanceOf(AccessDeniedException.class);
            assertThatThrownBy(() -> statusController.summary())
                    .isInstanceOf(AccessDeniedException.class);
        }
        verifyNoInteractions(service);
    }
}
