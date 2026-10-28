package com.internlink.core.infrastructure.security;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Getter
@Setter
@Configuration
@ConfigurationProperties(prefix = "internlink.auth.google")
public class GoogleAuthProperties {
    private boolean enabled;
    private String clientId = "";
    private java.util.Set<String> hostedDomains = java.util.Set.of();
}
