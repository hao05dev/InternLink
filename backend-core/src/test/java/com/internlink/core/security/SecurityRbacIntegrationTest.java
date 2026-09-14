package com.internlink.core.security;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class SecurityRbacIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    @DisplayName("Public endpoint should be accessible without authentication (200 OK)")
    void publicEndpoint_ShouldBeAccessible() throws Exception {
        mockMvc.perform(get("/api/v1/public/health"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("UP"));
    }

    @Test
    @DisplayName("Protected endpoint without token should return 401 Unauthorized")
    void protectedEndpoint_WithoutToken_ShouldReturn401() throws Exception {
        mockMvc.perform(get("/api/v1/admin/dashboard"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.error").value("Unauthorized"));
    }

    @Test
    @WithMockUser(username = "student@internlink.edu.vn", roles = { "STUDENT" })
    @DisplayName("Student accessing Admin endpoint should return 403 Forbidden")
    void studentAccessingAdminEndpoint_ShouldReturn403() throws Exception {
        mockMvc.perform(get("/api/v1/admin/dashboard"))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.error").value("Forbidden"));
    }

    @Test
    @WithMockUser(username = "admin@internlink.edu.vn", roles = { "ADMIN" })
    @DisplayName("Admin accessing Admin endpoint should pass authorization filter")
    void adminAccessingAdminEndpoint_ShouldPassSecurity() throws Exception {
        // Since /api/v1/admin/dashboard controller is not implemented yet,
        // passing authorization will yield 404 (Not Found) instead of 403 (Forbidden)
        mockMvc.perform(get("/api/v1/admin/dashboard"))
                .andExpect(status().isNotFound());
    }
}