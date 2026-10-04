package com.internlink.core.infrastructure.integration.storage;

import static org.assertj.core.api.Assertions.*;

import org.junit.jupiter.api.Test;

import java.io.*;
import java.net.*;
import java.util.concurrent.*;

class ClamAvScannerTest {
    @Test
    void cleanScanUsesFramedInstream() throws Exception {
        exercise("stream: OK", false);
    }

    @Test
    void infectedFileIsRejected() throws Exception {
        exercise("stream: Test FOUND", true);
    }

    @Test
    void unknownScanResultFailsClosed() throws Exception {
        exercise("stream: scan ERROR", true);
    }

    private void exercise(String result, boolean rejected) throws Exception {
        try (var server = new ServerSocket(0, 1, InetAddress.getLoopbackAddress());
                var executor = Executors.newSingleThreadExecutor()) {
            var reply =
                    executor.submit(
                            () -> {
                                try (var socket = server.accept()) {
                                    var input = new DataInputStream(socket.getInputStream());
                                    assertThat(input.readNBytes(10))
                                            .isEqualTo("zINSTREAM\0".getBytes());
                                    assertThat(input.readInt()).isEqualTo(3);
                                    assertThat(input.readNBytes(3)).isEqualTo(new byte[] {1, 2, 3});
                                    assertThat(input.readInt()).isZero();
                                    socket.getOutputStream().write((result + "\0").getBytes());
                                    return true;
                                }
                            });
            var scanner = new ClamAvScanner(true, "127.0.0.1", server.getLocalPort());
            if (rejected)
                assertThatThrownBy(() -> scanner.scan(new byte[] {1, 2, 3}))
                        .isInstanceOf(RuntimeException.class);
            else
                assertThatCode(() -> scanner.scan(new byte[] {1, 2, 3})).doesNotThrowAnyException();
            assertThat(reply.get(5, TimeUnit.SECONDS)).isTrue();
        }
    }
}
