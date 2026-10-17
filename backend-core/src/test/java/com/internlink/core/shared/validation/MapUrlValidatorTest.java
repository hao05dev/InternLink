package com.internlink.core.shared.validation;

import static org.assertj.core.api.Assertions.*;
import org.junit.jupiter.api.Test;
import com.internlink.core.shared.exception.BadRequestException;

class MapUrlValidatorTest {
    @Test void acceptsOnlyDedicatedEmbedUrls() {
        assertThat(MapUrlValidator.embed("https://www.google.com/maps/embed?pb=!1m18!test"))
                .isEqualTo("https://www.google.com/maps/embed?pb=!1m18!test");
        for (String url : new String[]{"javascript:alert(1)", "https://www.google.com.evil.test/maps/embed?pb=x",
                "https://www.google.com@evil.test/maps/embed?pb=x", "https://www.google.com/maps/place/test",
                "https://www.google.com:8443/maps/embed?pb=x", "https://maps.app.goo.gl/test"}) {
            assertThatThrownBy(() -> MapUrlValidator.embed(url)).isInstanceOf(BadRequestException.class);
        }
    }

    @Test void permitsShareLinksOnlyForDirectionsAndHandlesEmpty() {
        assertThat(MapUrlValidator.maps("https://maps.app.goo.gl/abc")).isNotNull();
        assertThat(MapUrlValidator.embed(" ")).isNull();
        assertThat(MapUrlValidator.maps(null)).isNull();
        assertThatThrownBy(() -> MapUrlValidator.website("javascript:alert(1)"))
                .isInstanceOf(BadRequestException.class);
    }
}
