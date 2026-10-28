package com.internlink.core.infrastructure.security;

import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import static org.assertj.core.api.Assertions.*;

class ClientIpResolverTest {
    @Test void ignoresSpoofedHeaderAndTrustsOnlyConfiguredProxyChain() {
        var request = new MockHttpServletRequest();
        request.setRemoteAddr("10.0.0.2");
        request.addHeader("X-Forwarded-For", "1.1.1.1, 10.0.0.1");
        assertThat(new ClientIpResolver("").resolve(request)).isEqualTo("10.0.0.2");
        assertThat(new ClientIpResolver("10.0.0.2,10.0.0.1").resolve(request)).isEqualTo("1.1.1.1");
        assertThat(new ClientIpResolver("10.0.0.2").resolve(request)).isEqualTo("10.0.0.1");
    }
}
