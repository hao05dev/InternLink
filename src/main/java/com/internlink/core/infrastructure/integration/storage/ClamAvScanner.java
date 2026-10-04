package com.internlink.core.infrastructure.integration.storage;

import com.internlink.core.shared.exception.BadRequestException;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.io.*;
import java.net.*;
import java.nio.charset.StandardCharsets;

@Component
public class ClamAvScanner {
    private final boolean enabled;
    private final String host;
    private final int port;

    public ClamAvScanner(
            @Value("${internlink.storage.scanner.enabled:false}") boolean enabled,
            @Value("${internlink.storage.scanner.host:127.0.0.1}") String host,
            @Value("${internlink.storage.scanner.port:3310}") int port) {
        this.enabled = enabled;
        this.host = host;
        this.port = port;
    }

    public boolean enabled() {
        return enabled;
    }

    public void scan(byte[] bytes) {
        if (!enabled) return;
        try (var socket = new Socket()) {
            socket.connect(new InetSocketAddress(host, port), 3000);
            socket.setSoTimeout(30000);
            var out = new DataOutputStream(socket.getOutputStream());
            out.write("zINSTREAM\0".getBytes(StandardCharsets.US_ASCII));
            for (int i = 0; i < bytes.length; i += 8192) {
                int size = Math.min(8192, bytes.length - i);
                out.writeInt(size);
                out.write(bytes, i, size);
            }
            out.writeInt(0);
            out.flush();
            var response = new ByteArrayOutputStream();
            int value;
            while (response.size() < 1024 && (value = socket.getInputStream().read()) > 0)
                response.write(value);
            String result = response.toString(StandardCharsets.UTF_8);
            if (result.endsWith(" FOUND"))
                throw new BadRequestException("Tệp bị từ chối do phát hiện mã độc");
            if (!"stream: OK".equals(result))
                throw new IllegalStateException("Không xác nhận được kết quả quét tệp");
        } catch (IOException ex) {
            throw new IllegalStateException("Dịch vụ quét tệp chưa sẵn sàng");
        }
    }
}
