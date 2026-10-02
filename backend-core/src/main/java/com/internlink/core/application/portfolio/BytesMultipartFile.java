package com.internlink.core.application.portfolio;

import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;

public class BytesMultipartFile implements MultipartFile {
    private final String name;
    private final String contentType;
    private final byte[] bytes;

    public BytesMultipartFile(String name, String contentType, byte[] bytes) {
        this.name = name;
        this.contentType = contentType;
        this.bytes = bytes;
    }

    public String name() {
        return name;
    }

    public String contentType() {
        return contentType;
    }

    public byte[] bytes() {
        return bytes;
    }

    @Override
    public String getName() {
        return "file";
    }

    @Override
    public String getOriginalFilename() {
        return name;
    }

    @Override
    public String getContentType() {
        return contentType;
    }

    @Override
    public boolean isEmpty() {
        return bytes == null || bytes.length == 0;
    }

    @Override
    public long getSize() {
        return bytes != null ? bytes.length : 0;
    }

    @Override
    public byte[] getBytes() {
        return bytes;
    }

    @Override
    public InputStream getInputStream() {
        return new ByteArrayInputStream(bytes != null ? bytes : new byte[0]);
    }

    @Override
    public void transferTo(File file) throws IOException {
        Files.write(file.toPath(), bytes != null ? bytes : new byte[0]);
    }
}
