package com.internlink.core;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import java.io.BufferedReader;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

@SpringBootApplication
public class BackendCoreApplication {
    public static void main(String[] args) {
        loadEnvIfPresent();
        SpringApplication.run(BackendCoreApplication.class, args);
    }

    private static void loadEnvIfPresent() {
        readFileIfPresent(Path.of("../.env"));
        readFileIfPresent(Path.of(".env"));
    }

    private static void readFileIfPresent(Path envPath) {
        if (!Files.isRegularFile(envPath)) {
            return;
        }
        try (BufferedReader reader = Files.newBufferedReader(envPath)) {
            String line;
            while ((line = reader.readLine()) != null) {
                line = line.trim();
                if (line.isEmpty() || line.startsWith("#")) {
                    continue;
                }
                int eq = line.indexOf('=');
                if (eq <= 0) {
                    continue;
                }
                String key = line.substring(0, eq).trim();
                String val = line.substring(eq + 1).trim();
                if (val.startsWith("\"") && val.endsWith("\"") && val.length() >= 2) {
                    val = val.substring(1, val.length() - 1);
                } else if (val.startsWith("'") && val.endsWith("'") && val.length() >= 2) {
                    val = val.substring(1, val.length() - 1);
                }
                if (!val.isEmpty()) {
                    String existingEnv = System.getenv(key);
                    if (existingEnv == null || existingEnv.trim().isEmpty()) {
                        System.setProperty(key, val);
                    }
                }
            }
        } catch (IOException ignored) {
        }
    }
}

