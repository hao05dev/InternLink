package com.internlink.core.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    private static final String SECURITY_SCHEME_NAME = "BearerAuthentication";

    @Bean
    public OpenAPI openAPI() {
        return new OpenAPI()
                .addSecurityItem(new SecurityRequirement().addList(SECURITY_SCHEME_NAME))
                .components(new Components().addSecuritySchemes(SECURITY_SCHEME_NAME,
                        new SecurityScheme()
                                .name(SECURITY_SCHEME_NAME)
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("bearer")
                                .bearerFormat("JWT")
                                .description("Nhập Bearer JWT token của bạn để xác thực API (ví dụ: `eyJhbGciOi...`)")))
                .info(new Info()
                        .title("InternLink Core Backend RESTful API")
                        .description(
                                "Nền tảng Quản lý Toàn trình Thực tập & Đối sánh Năng lực Tích hợp AI (Erasmus+ BP9.1, ILO 208 BP9.2, QAA UK BP9.3, NACE BP9.4 & ESCO Taxonomy)")
                        .version("v1.0.0")
                        .contact(new Contact()
                                .name("InternLink Engineering Team")
                                .email("admin@internlink.edu.vn")
                                .url("https://internlink.edu.vn"))
                        .license(new License()
                                .name("Apache 2.0")
                                .url("https://springdoc.org")));
    }
}