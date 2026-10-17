package com.internlink.core.shared.validation;

import com.internlink.core.shared.exception.BadRequestException;
import java.net.URI;
import java.util.Set;

/** Validates stored URLs without following redirects or making network requests. */
public final class MapUrlValidator {
    private static final Set<String> MAP_HOSTS = Set.of("www.google.com", "google.com", "maps.google.com");

    private MapUrlValidator() {}

    public static String embed(String value) {
        URI uri = parse(value);
        if (uri == null) return null;
        if (!MAP_HOSTS.contains(uri.getHost()) || !"/maps/embed".equals(uri.getPath())
                || uri.getRawQuery() == null || !uri.getRawQuery().startsWith("pb=")) {
            throw new BadRequestException("Dùng URL trong mục Google Maps → Chia sẻ → Nhúng bản đồ.");
        }
        return uri.toASCIIString();
    }

    public static String maps(String value) {
        URI uri = parse(value);
        if (uri == null) return null;
        boolean regular = MAP_HOSTS.contains(uri.getHost())
                && ("/maps".equals(uri.getPath()) || uri.getPath().startsWith("/maps/"));
        boolean shortLink = "maps.app.goo.gl".equals(uri.getHost())
                || ("goo.gl".equals(uri.getHost()) && uri.getPath().startsWith("/maps/"));
        if (!regular && !shortLink) throw new BadRequestException("Liên kết chỉ đường phải là Google Maps.");
        return uri.toASCIIString();
    }

    public static String website(String value) {
        URI uri = parse(value);
        return uri == null ? null : uri.toASCIIString();
    }

    private static URI parse(String value) {
        if (value == null || value.isBlank()) return null;
        try {
            URI uri = URI.create(value.trim());
            if (value.length() > 8192 || !"https".equals(uri.getScheme()) || uri.getHost() == null
                    || uri.getUserInfo() != null || uri.getPort() != -1 || uri.getFragment() != null) {
                throw new IllegalArgumentException();
            }
            return uri;
        } catch (IllegalArgumentException ex) {
            throw new BadRequestException("Liên kết không hợp lệ. Vui lòng dùng URL HTTPS đầy đủ.");
        }
    }
}
