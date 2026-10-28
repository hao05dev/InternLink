package com.internlink.core.infrastructure.security;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import java.util.Arrays;
import java.util.Set;
import java.util.stream.Collectors;

@Component
public class ClientIpResolver {
    private final Set<String> trustedProxies;
    public ClientIpResolver(@Value("${internlink.security.trusted-proxies:}") String proxies) {
        trustedProxies = Arrays.stream(proxies.split(",")).map(String::trim)
                .filter(value -> !value.isEmpty()).collect(Collectors.toSet());
    }
    public String resolve(HttpServletRequest request) {
        if (request == null) return null;
        String remote = request.getRemoteAddr();
        if (!trustedProxies.contains(remote)) return remote;
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded == null || forwarded.isBlank()) return remote;
        String[] chain = forwarded.split(",");
        for (int i = chain.length - 1; i >= 0; i--) {
            String ip = chain[i].trim();
            if (!ip.matches("[0-9a-fA-F:.]{2,45}")) return remote;
            if (!trustedProxies.contains(ip)) return ip;
        }
        return remote;
    }
}
