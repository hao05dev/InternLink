package com.internlink.core.application.auth;

import com.internlink.core.infrastructure.persistence.jpa.JpaUserRepository;
import com.internlink.core.infrastructure.security.GoogleTokenVerifier;
import com.internlink.core.shared.exception.UnauthorizedException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.OffsetDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class GoogleAccountLinkService {
    private final JpaUserRepository users;
    private final GoogleTokenVerifier verifier;

    @Transactional
    public void link(UUID userId, String token) {
        var identity = verifier.verify(token);
        var user = users.findByIdForUpdate(userId).orElseThrow(() -> new UnauthorizedException("Tài khoản không hợp lệ"));
        if (!identity.emailVerified() || !identity.email().equalsIgnoreCase(user.getEmail())
                || !Boolean.TRUE.equals(user.getIsActive()) || Boolean.TRUE.equals(user.getMustChangePassword())
                || user.getGoogleSubject() != null && !user.getGoogleSubject().equals(identity.sub())) {
            throw new UnauthorizedException("Không thể liên kết danh tính Google này");
        }
        user.setGoogleSubject(identity.sub());
        user.setEmailVerifiedAt(OffsetDateTime.now());
        users.saveAndFlush(user);
    }
}
