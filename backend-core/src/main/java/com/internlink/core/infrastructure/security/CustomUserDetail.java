package com.internlink.core.infrastructure.security;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.internlink.core.domain.auth.User;
import com.internlink.core.shared.enums.UserRole;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;
import java.util.UUID;

@Getter
@Builder
@AllArgsConstructor
public class CustomUserDetail implements UserDetails {

    private final UUID id;
    private final String email;
    @JsonIgnore
    private final String password;
    private final String fullName;
    private final UserRole role;
    private final boolean isActive;
    private final Collection<? extends GrantedAuthority> authorities;

    public static CustomUserDetail create(User user) {
        List<GrantedAuthority> authorities = List.of(
            new SimpleGrantedAuthority("ROLE_" + user.getRole().name())
        );

        return CustomUserDetail.builder()
            .id(user.getId())
            .email(user.getEmail())
            .password(user.getPasswordHash())
            .fullName(user.getFullName())
            .role(user.getRole())
            .isActive(Boolean.TRUE.equals(user.getIsActive()))
            .authorities(authorities)
            .build();
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return isActive;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return isActive;
    }
}