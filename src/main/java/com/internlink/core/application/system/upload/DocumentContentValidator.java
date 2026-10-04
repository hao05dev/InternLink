package com.internlink.core.application.system.upload;

import com.internlink.core.shared.exception.BadRequestException;

import org.springframework.stereotype.Component;

import java.io.*;
import java.nio.charset.StandardCharsets;
import java.util.*;
import java.util.zip.ZipInputStream;

@Component
public class DocumentContentValidator {
    public static final Map<String, String> MIME =
            Map.of(
                    "pdf",
                    "application/pdf",
                    "png",
                    "image/png",
                    "jpg",
                    "image/jpeg",
                    "jpeg",
                    "image/jpeg",
                    "txt",
                    "text/plain",
                    "docx",
                    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                    "xlsx",
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");

    public String declared(String name, String mime) {
        String ext = extension(name);
        String expected = MIME.get(ext);
        if (expected == null || !expected.equals(mime))
            throw new BadRequestException(
                    "Chỉ nhận PDF, PNG, JPEG, TXT, DOCX hoặc XLSX với MIME đúng");
        return expected;
    }

    public void validate(String name, String mime, byte[] bytes) {
        declared(name, mime);
        String ext = extension(name);
        boolean valid =
                switch (ext) {
                    case "txt" -> text(bytes);
                    case "pdf" -> starts(bytes, "%PDF-".getBytes(StandardCharsets.US_ASCII));
                    case "png" ->
                            starts(bytes, new byte[] {(byte) 137, 80, 78, 71, 13, 10, 26, 10});
                    case "jpg", "jpeg" ->
                            bytes.length >= 3
                                    && bytes[0] == (byte) 255
                                    && bytes[1] == (byte) 216
                                    && bytes[2] == (byte) 255;
                    default -> office(bytes, ext);
                };
        if (!valid) throw new BadRequestException("Nội dung tệp không khớp định dạng khai báo");
    }

    private String extension(String name) {
        if (name == null
                || name.isBlank()
                || name.length() > 180
                || name.contains("/")
                || name.contains("\\")
                || name.chars().anyMatch(Character::isISOControl))
            throw new BadRequestException("Tên tệp không hợp lệ");
        int dot = name.lastIndexOf('.');
        return dot < 0 ? "" : name.substring(dot + 1).toLowerCase(Locale.ROOT);
    }

    private boolean text(byte[] bytes) {
        try {
            String value =
                    StandardCharsets.UTF_8
                            .newDecoder()
                            .onMalformedInput(java.nio.charset.CodingErrorAction.REPORT)
                            .decode(java.nio.ByteBuffer.wrap(bytes))
                            .toString();
            return !value.isBlank() && value.indexOf(0) < 0;
        } catch (java.nio.charset.CharacterCodingException ex) {
            return false;
        }
    }

    private boolean starts(byte[] bytes, byte[] prefix) {
        if (bytes.length < prefix.length) return false;
        for (int i = 0; i < prefix.length; i++) if (bytes[i] != prefix[i]) return false;
        return true;
    }

    private boolean office(byte[] bytes, String ext) {
        boolean types = false, main = false;
        int count = 0;
        long expanded = 0;
        try (var zip = new ZipInputStream(new ByteArrayInputStream(bytes))) {
            java.util.zip.ZipEntry entry;
            while ((entry = zip.getNextEntry()) != null) {
                if (++count > 2000
                        || entry.getName().contains("..")
                        || entry.getName().startsWith("/")
                        || entry.getName().toLowerCase(Locale.ROOT).contains("vbaproject"))
                    return false;
                types |= "[Content_Types].xml".equals(entry.getName());
                main |=
                        ("docx".equals(ext) ? "word/document.xml" : "xl/workbook.xml")
                                .equals(entry.getName());
                byte[] buffer = new byte[8192];
                int read;
                while ((read = zip.read(buffer)) != -1) {
                    expanded += read;
                    if (expanded > 80L * 1024 * 1024) return false;
                }
            }
            return types && main;
        } catch (IOException ex) {
            return false;
        }
    }
}
