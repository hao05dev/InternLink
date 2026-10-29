package com.internlink.core.infrastructure.integration.storage;

import com.internlink.core.shared.exception.ResourceNotFoundException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.core.io.ByteArrayResource;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class OfficialTemplateStoreTest {

    @Mock
    private R2StorageService r2;

    @Test
    void find_readsFromFixedR2KeyUnderPrefix() {
        when(r2.prefix()).thenReturn("internlink");
        ByteArrayResource expected = new ByteArrayResource("doc".getBytes());
        when(r2.loadAsResource("internlink/templates/official/M-TT-05-Maubaocao.doc")).thenReturn(expected);

        Optional<org.springframework.core.io.Resource> result =
            new OfficialTemplateStore(r2).find("M-TT-05-Maubaocao.doc");

        assertThat(result).containsSame(expected);
    }

    @Test
    void find_returnsEmptyWhenObjectMissingInR2() {
        when(r2.prefix()).thenReturn("internlink");
        when(r2.loadAsResource("internlink/templates/official/missing.doc"))
            .thenThrow(new ResourceNotFoundException("Không tìm thấy tệp trên R2"));

        assertThat(new OfficialTemplateStore(r2).find("missing.doc")).isEmpty();
    }

    @Test
    void find_rejectsPathLikeNames() {
        assertThat(new OfficialTemplateStore(r2).find("../secret.doc")).isEmpty();
        assertThat(new OfficialTemplateStore(r2).find("")).isEmpty();
    }
}
