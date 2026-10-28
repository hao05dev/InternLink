package com.internlink.core.infrastructure.security;

import org.junit.jupiter.api.Test;
import org.springframework.mock.env.MockEnvironment;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import java.util.List;
import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

class ProductionAuthConfigurationValidatorTest {
    private MockEnvironment environment() {
        return new MockEnvironment().withProperty("internlink.jwt.secret", "a-random-enough-test-key-over-32-characters")
                .withProperty("internlink.cors.allowed-origins", "https://app.example.test")
                .withProperty("internlink.email.public-base-url", "https://app.example.test");
    }
    @Test void acceptsSecureConfigurationButRejectsDemoPasswords() {
        var cookies = new CookieProperties();
        cookies.setSecure(true);
        var jdbc = mock(JdbcTemplate.class);
        var passwords = mock(PasswordEncoder.class);
        when(jdbc.queryForList(anyString(), eq(String.class))).thenReturn(List.of("hash"));
        var validator = new ProductionAuthConfigurationValidator(environment(), cookies, jdbc, passwords);
        assertThatCode(validator::afterSingletonsInstantiated).doesNotThrowAnyException();
        when(passwords.matches("Password@123", "hash")).thenReturn(true);
        assertThatThrownBy(validator::afterSingletonsInstantiated).hasMessageContaining("mật khẩu demo");
    }
    @Test void rejectsUnsafeCookieAndOriginsBeforeReadingDatabase() {
        var jdbc = mock(JdbcTemplate.class);
        var validator = new ProductionAuthConfigurationValidator(environment(), new CookieProperties(), jdbc, mock(PasswordEncoder.class));
        assertThatThrownBy(validator::afterSingletonsInstantiated).isInstanceOf(IllegalStateException.class);
        verifyNoInteractions(jdbc);
    }
}
