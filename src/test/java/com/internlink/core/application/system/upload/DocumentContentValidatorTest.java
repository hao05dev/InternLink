package com.internlink.core.application.system.upload;

import static org.assertj.core.api.Assertions.*;

import org.junit.jupiter.api.Test;

import java.io.*;
import java.util.zip.*;

class DocumentContentValidatorTest {
    DocumentContentValidator validator = new DocumentContentValidator();

    @Test
    void rejectsExecutableRenamedAsPdf() {
        assertThatThrownBy(
                        () ->
                                validator.validate(
                                        "cv.pdf", "application/pdf", "MZ executable".getBytes()))
                .hasMessageContaining("khớp");
    }

    @Test
    void rejectsDeclaredTypeAndPathInjection() {
        assertThatThrownBy(() -> validator.declared("../cv.pdf", "application/pdf"))
                .isInstanceOf(RuntimeException.class);
        assertThatThrownBy(() -> validator.declared("cv.pdf", "text/html"))
                .isInstanceOf(RuntimeException.class);
    }

    @Test
    void acceptsPdfAndUtf8Cv() {
        assertThatCode(() -> validator.validate("cv.pdf", "application/pdf", "%PDF-1.7".getBytes()))
                .doesNotThrowAnyException();
        assertThatCode(
                        () ->
                                validator.validate(
                                        "cv.txt",
                                        "text/plain",
                                        "Kỹ năng Java"
                                                .getBytes(java.nio.charset.StandardCharsets.UTF_8)))
                .doesNotThrowAnyException();
    }

    @Test
    void rejectsMalformedText() {
        assertThatThrownBy(
                        () ->
                                validator.validate(
                                        "cv.txt", "text/plain", new byte[] {(byte) 255, 0}))
                .isInstanceOf(RuntimeException.class);
    }

    @Test
    void rejectsZipWithoutOfficeContentAndMacros() throws Exception {
        for (String entry : new String[] {"data.txt", "word/vbaProject.bin"}) {
            var bytes = new ByteArrayOutputStream();
            try (var zip = new ZipOutputStream(bytes)) {
                zip.putNextEntry(new ZipEntry(entry));
                zip.write("data".getBytes());
                zip.closeEntry();
            }
            assertThatThrownBy(
                            () ->
                                    validator.validate(
                                            "cv.docx",
                                            DocumentContentValidator.MIME.get("docx"),
                                            bytes.toByteArray()))
                    .isInstanceOf(RuntimeException.class);
        }
    }
}
