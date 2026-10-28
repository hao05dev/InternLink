package com.internlink.core.infrastructure.security;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.SmartInitializingSingleton;
import org.springframework.context.annotation.Profile;
import org.springframework.core.env.Environment;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@Profile("prod")
@RequiredArgsConstructor
public class ProductionAuthConfigurationValidator implements SmartInitializingSingleton {
    private final Environment environment;
    private final CookieProperties cookies;
    private final JdbcTemplate jdbc;
    private final PasswordEncoder passwords;

    @Override
    public void afterSingletonsInstantiated() {
        String secret = environment.getRequiredProperty("internlink.jwt.secret");
        String origins = environment.getRequiredProperty("internlink.cors.allowed-origins");
        String publicUrl = environment.getRequiredProperty("internlink.email.public-base-url");
        if (secret.equals("404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970")
                || secret.length() < 32 || !cookies.isSecure() || origins.contains("*")
                || !publicUrl.startsWith("https://")
                || java.util.Arrays.stream(origins.split(",")).anyMatch(o -> !o.trim().startsWith("https://"))) {
            throw new IllegalStateException("Cấu hình xác thực production chưa an toàn; xem auth-deployment-runbook.md");
        }
        for (String hash : jdbc.queryForList("select password_hash from users where is_active = true", String.class)) {
            if (passwords.matches("Password@123", hash)) {
                throw new IllegalStateException("Còn tài khoản active dùng mật khẩu demo; cần xử lý trước production");
            }
        }
    }
}
