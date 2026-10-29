package com.internlink.core.shared.validation;

import static org.assertj.core.api.Assertions.*;

import com.internlink.core.shared.exception.BadRequestException;

import org.junit.jupiter.api.Test;

import java.util.Collections;

class ImportRowLimitTest {
    @Test
    void rejectsEmptyAndOversizedImports() {
        assertThatThrownBy(() -> ImportRowLimit.check(Collections.emptyList()))
                .isInstanceOf(BadRequestException.class);
        assertThatThrownBy(() -> ImportRowLimit.check(null))
                .isInstanceOf(BadRequestException.class);
        var tooMany = Collections.nCopies(ImportRowLimit.MAX_ROWS + 1, "row");
        assertThatThrownBy(() -> ImportRowLimit.check(tooMany))
                .hasMessageContaining("tối đa " + ImportRowLimit.MAX_ROWS);
    }

    @Test
    void acceptsImportWithinLimit() {
        assertThatCode(() -> ImportRowLimit.check(Collections.nCopies(ImportRowLimit.MAX_ROWS, "row")))
                .doesNotThrowAnyException();
    }
}
