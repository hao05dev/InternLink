package com.internlink.core.application.company;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;
import com.internlink.core.domain.auth.User;
import com.internlink.core.domain.company.Company;
import com.internlink.core.infrastructure.persistence.jpa.JpaUserRepository;
import com.internlink.core.infrastructure.security.CustomUserDetail;
import com.internlink.core.shared.security.SecurityGuard;
import com.internlink.core.shared.enums.UserRole;
import com.internlink.core.shared.exception.ForbiddenException;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.Test;

class CompanyAccessPolicyTest {
    @Test void representativeCanEditOnlyTheirOwnCompany() {
        var company = new Company(); company.setId(UUID.randomUUID());
        var user = User.builder().role(UserRole.COMPANY_REP).company(company).isActive(true).build();
        user.setId(UUID.randomUUID());
        var guard = mock(SecurityGuard.class);
        var users = mock(JpaUserRepository.class);
        when(guard.currentUser()).thenReturn(CustomUserDetail.create(user));
        when(users.findById(user.getId())).thenReturn(Optional.of(user));
        var policy = new CompanyAccessPolicy(guard, users);
        assertThat(policy.ownCompany()).isSameAs(company);
        assertThatCode(() -> policy.requireOwner(company.getId())).doesNotThrowAnyException();
        assertThatThrownBy(() -> policy.requireOwner(UUID.randomUUID())).isInstanceOf(ForbiddenException.class);
        user.setCompany(null);
        assertThatThrownBy(policy::ownCompany).isInstanceOf(ForbiddenException.class);
        user.setCompany(company); user.setRole(UserRole.COMPANY_MENTOR);
        assertThatThrownBy(policy::ownCompany).isInstanceOf(ForbiddenException.class);
    }
}
