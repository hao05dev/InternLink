package com.internlink.core.application.auth;

import com.internlink.core.application.auth.impl.PasswordLoginService;
import com.internlink.core.domain.auth.*;
import com.internlink.core.infrastructure.persistence.jpa.*;
import com.internlink.core.infrastructure.security.*;
import com.internlink.core.presentation.auth.dto.request.ResetPasswordRequest;
import com.internlink.core.shared.enums.UserRole;
import com.internlink.core.shared.exception.UnauthorizedException;
import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.EnumSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.mock.web.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import java.time.OffsetDateTime;
import java.util.UUID;
import static org.assertj.core.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(properties = {
    "spring.datasource.url=jdbc:h2:mem:auth_review;MODE=PostgreSQL;DATABASE_TO_LOWER=TRUE",
    "spring.datasource.driver-class-name=org.h2.Driver", "spring.datasource.username=sa", "spring.datasource.password=",
    "spring.flyway.enabled=false", "spring.jpa.hibernate.ddl-auto=create-drop",
    "spring.jpa.database-platform=org.hibernate.dialect.H2Dialect",
    "spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.H2Dialect",
    "spring.sql.init.mode=always", "spring.sql.init.schema-locations=classpath:schema-h2.sql",
    "internlink.jwt.secret=auth-integration-test-secret-at-least-32-characters",
    "internlink.rate-limit.enabled=false", "notifications.reminders-enabled=false",
    "internlink.email.enabled=false"
})
@AutoConfigureMockMvc
class AuthTransactionIntegrationTest {
    @Autowired JpaUserRepository users;
    @Autowired JpaAuthSessionFamilyRepository families;
    @Autowired JpaPasswordResetTokenRepository resetTokens;
    @Autowired PasswordLoginService passwordLogin;
    @Autowired RefreshTokenService refresh;
    @Autowired PasswordResetService reset;
    @Autowired PasswordEncoder passwords;
    @Autowired TokenCryptoUtils crypto;
    @Autowired JwtUtil jwt;
    @Autowired MockMvc mvc;
    @Autowired PasswordManagementService passwordManagement;
    @Autowired com.fasterxml.jackson.databind.ObjectMapper json;

    private User user(UserRole role, boolean changePassword) {
        return users.saveAndFlush(User.builder().email(UUID.randomUUID() + "@example.test")
                .fullName("Auth test").passwordHash(passwords.encode("a memorable test passphrase"))
                .role(role).mustChangePassword(changePassword).isActive(true).build());
    }

    @Test void failedAttemptsCommitAndCorrectPasswordCannotBypassLock() {
        User user = user(UserRole.STUDENT, false);
        for (int i = 0; i < 5; i++) assertThat(passwordLogin.authenticate(user.getEmail(), "wrong")).isNull();
        User stored = users.findById(user.getId()).orElseThrow();
        assertThat(stored.getFailedLoginAttempts()).isEqualTo(5);
        assertThat(stored.getLockedUntil()).isAfter(OffsetDateTime.now());
        assertThat(passwordLogin.authenticate(user.getEmail(), "a memorable test passphrase")).isNull();
    }

    @Test void replayRevocationCommitsEvenWhenRefreshThrows() {
        User user = user(UserRole.STUDENT, false);
        String raw = refresh.createSessionAndToken(user, null, new MockHttpServletResponse());
        var request = new MockHttpServletRequest();
        request.setCookies(new Cookie("refresh_token", raw));
        refresh.rotateRefreshToken(request, new MockHttpServletResponse());
        assertThatThrownBy(() -> refresh.rotateRefreshToken(request, new MockHttpServletResponse()))
                .isInstanceOf(UnauthorizedException.class);
        assertThat(families.findByUserIdAndRevokedAtIsNull(user.getId())).isEmpty();
    }

    @Test void activationChecksPurposeAndConsumesTokenExactlyOnce() {
        User user = user(UserRole.LECTURER, true);
        var token = resetTokens.saveAndFlush(PasswordResetToken.builder().user(user)
                .tokenHash(crypto.hashToken("activation-token")).purpose("ACCOUNT_ACTIVATION")
                .expiresAt(OffsetDateTime.now().plusHours(1)).build());
        var request = ResetPasswordRequest.builder().token("activation-token").newPassword("my new long passphrase")
                .confirmPassword("my new long passphrase").build();
        assertThatThrownBy(() -> reset.resetPassword(request)).hasMessageContaining("Liên kết");
        assertThat(resetTokens.findById(token.getId()).orElseThrow().getUsedAt()).isNull();
        var activationRequest = ResetPasswordRequest.builder().token("activation-token")
                .purpose("ACCOUNT_ACTIVATION").newPassword("my new long passphrase")
                .confirmPassword("my new long passphrase").build();
        reset.resetPassword(activationRequest);
        assertThat(users.findById(user.getId()).orElseThrow().getMustChangePassword()).isFalse();
        assertThatThrownBy(() -> reset.resetPassword(activationRequest)).isInstanceOf(RuntimeException.class);
    }

    @ParameterizedTest @EnumSource(UserRole.class)
    void allRolesCanReadOwnIdentityButOnlyAdminCanListUsers(UserRole role) throws Exception {
        User user = user(role, false);
        String bearer = "Bearer " + jwt.generateToken(CustomUserDetail.create(user));
        mvc.perform(get("/api/v1/auth/me").header("Authorization", bearer))
                .andExpect(status().isOk()).andExpect(jsonPath("$.data.role").value(role.name()));
        mvc.perform(get("/api/v1/admin/users").header("Authorization", bearer))
                .andExpect(role == UserRole.ADMIN ? status().isOk() : status().isForbidden());
    }

    @Test void mustChangePasswordBlocksBusinessApiAndLoginRequiresCsrf() throws Exception {
        User user = user(UserRole.STUDENT, true);
        String bearer = "Bearer " + jwt.generateToken(CustomUserDetail.create(user));
        mvc.perform(get("/api/v1/terms").header("Authorization", bearer)).andExpect(status().isForbidden());
        mvc.perform(post("/api/v1/auth/login").contentType("application/json")
                .content("{\"email\":\"test@example.com\",\"password\":\"wrong\"}"))
                .andExpect(status().isForbidden());
        mvc.perform(get("/api/v1/auth/csrf")).andExpect(status().isOk())
                .andExpect(cookie().exists("XSRF-TOKEN"));
    }

    @Test void registerCompanySetsBothCookiesAndRestoresOrganization() throws Exception {
        Cookie csrf = mvc.perform(get("/api/v1/auth/csrf")).andReturn().getResponse().getCookie("XSRF-TOKEN");
        String email = UUID.randomUUID() + "@company.test";
        var payload = java.util.Map.of("companyName", "Auth test company", "taxCode", UUID.randomUUID().toString(),
                "address", java.util.Map.of("street", "1 Main Street", "district", "Ninh Kieu", "province", "Can Tho"),
                "fullName", "Company HR", "email", email, "phoneNumber", "0901234567",
                "password", "a company secret passphrase");
        var response = mvc.perform(post("/api/v1/auth/register/company").cookie(csrf)
                .header("X-XSRF-TOKEN", csrf.getValue()).contentType("application/json")
                .content(json.writeValueAsString(payload)))
                .andExpect(status().isCreated()).andExpect(cookie().exists("access_token"))
                .andExpect(cookie().exists("refresh_token")).andReturn().getResponse();
        mvc.perform(get("/api/v1/auth/session").cookie(response.getCookie("access_token")))
                .andExpect(status().isOk()).andExpect(jsonPath("$.data.role").value("COMPANY_REP"))
                .andExpect(jsonPath("$.data.companyId").isNotEmpty());
    }

    @Test void passwordChangeInvalidatesAccessImmediatelyAndFreshLoginWorks() throws Exception {
        User user = user(UserRole.STUDENT, false);
        String oldToken = jwt.generateToken(CustomUserDetail.create(user));
        passwordManagement.changePassword(user.getId(),
                com.internlink.core.presentation.auth.dto.request.ChangePasswordRequest.builder()
                .currentPassword("a memorable test passphrase").newPassword("another secure passphrase")
                .confirmPassword("another secure passphrase").build());
        mvc.perform(get("/api/v1/auth/me").header("Authorization", "Bearer " + oldToken))
                .andExpect(status().isUnauthorized());
        User current = passwordLogin.authenticate(user.getEmail(), "another secure passphrase");
        mvc.perform(get("/api/v1/auth/me").header("Authorization", "Bearer " + jwt.generateToken(CustomUserDetail.create(current))))
                .andExpect(status().isOk());
    }

    @Test void concurrentRefreshIssuesOnlyOneReplacementAndRevokesOnReplay() throws Exception {
        User user = user(UserRole.STUDENT, false);
        String raw = refresh.createSessionAndToken(user, null, new MockHttpServletResponse());
        var start = new java.util.concurrent.CountDownLatch(1);
        java.util.concurrent.Callable<Boolean> operation = () -> {
            start.await();
            var request = new MockHttpServletRequest();
            request.setCookies(new Cookie("refresh_token", raw));
            try { refresh.rotateRefreshToken(request, new MockHttpServletResponse()); return true; }
            catch (UnauthorizedException ex) { return false; }
        };
        try (var executor = java.util.concurrent.Executors.newVirtualThreadPerTaskExecutor()) {
            var first = executor.submit(operation);
            var second = executor.submit(operation);
            start.countDown();
            assertThat(java.util.List.of(first.get(10, java.util.concurrent.TimeUnit.SECONDS),
                    second.get(10, java.util.concurrent.TimeUnit.SECONDS))).containsExactlyInAnyOrder(true, false);
        }
        assertThat(families.findByUserIdAndRevokedAtIsNull(user.getId())).isEmpty();
    }

    @Test void malformedRegistrationPayloadReturnsBadRequest() throws Exception {
        Cookie csrf = mvc.perform(get("/api/v1/auth/csrf")).andReturn().getResponse().getCookie("XSRF-TOKEN");
        mvc.perform(post("/api/v1/auth/register/company").cookie(csrf).header("X-XSRF-TOKEN", csrf.getValue())
                .contentType("application/json").content("{"))
                .andExpect(status().isBadRequest());
    }
}
