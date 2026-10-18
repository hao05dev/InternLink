package com.internlink.core.infrastructure.security;

/**
 * Đảm nhiệm duy nhất 1 nhiệm vụ: Xác minh Google ID Token với nhà cung cấp danh tính Google.
 */
public interface GoogleTokenVerifier {

    GoogleUserInfo verify(String idToken);

    record GoogleUserInfo(String sub, String email, String name, boolean emailVerified) {}
}
