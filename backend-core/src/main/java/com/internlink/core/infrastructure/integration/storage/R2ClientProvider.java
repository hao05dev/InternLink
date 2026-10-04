package com.internlink.core.infrastructure.integration.storage;

import jakarta.annotation.PreDestroy;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Component;

import software.amazon.awssdk.auth.credentials.*;
import software.amazon.awssdk.core.checksums.*;
import software.amazon.awssdk.http.urlconnection.UrlConnectionHttpClient;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.*;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;

import java.net.URI;
import java.time.Duration;

@Component
@RequiredArgsConstructor
public class R2ClientProvider {
    private final R2StorageProperties settings;
    private S3Client client;
    private S3Presigner presigner;

    private URI endpoint() {
        URI uri;
        try {
            uri = URI.create(settings.getEndpoint());
        } catch (RuntimeException ex) {
            throw new IllegalStateException("R2_ENDPOINT không hợp lệ");
        }
        if (!"https".equals(uri.getScheme())
                || uri.getHost() == null
                || !uri.getHost().endsWith(".r2.cloudflarestorage.com")
                || uri.getUserInfo() != null
                || uri.getQuery() != null
                || uri.getFragment() != null
                || !(uri.getPath().isEmpty() || "/".equals(uri.getPath()))
                || settings.getBucket().isBlank()
                || settings.getAccessKeyId().isBlank()
                || settings.getSecretAccessKey().isBlank())
            throw new IllegalStateException("Cần endpoint, bucket và S3 credentials của R2");
        return uri;
    }

    private StaticCredentialsProvider credentials() {
        return StaticCredentialsProvider.create(
                AwsBasicCredentials.create(
                        settings.getAccessKeyId(), settings.getSecretAccessKey()));
    }

    private S3Configuration configuration() {
        return S3Configuration.builder()
                .pathStyleAccessEnabled(true)
                .chunkedEncodingEnabled(false)
                .build();
    }

    public synchronized S3Client client() {
        if (client == null)
            client =
                    S3Client.builder()
                            .endpointOverride(endpoint())
                            .region(Region.of("auto"))
                            .credentialsProvider(credentials())
                            .serviceConfiguration(configuration())
                            .httpClientBuilder(
                                    UrlConnectionHttpClient.builder()
                                            .connectionTimeout(Duration.ofSeconds(5))
                                            .socketTimeout(Duration.ofSeconds(30)))
                            .overrideConfiguration(
                                    c ->
                                            c.apiCallTimeout(Duration.ofSeconds(45))
                                                    .apiCallAttemptTimeout(Duration.ofSeconds(35)))
                            .requestChecksumCalculation(RequestChecksumCalculation.WHEN_REQUIRED)
                            .responseChecksumValidation(ResponseChecksumValidation.WHEN_REQUIRED)
                            .build();
        return client;
    }

    public synchronized S3Presigner presigner() {
        if (presigner == null)
            presigner =
                    S3Presigner.builder()
                            .endpointOverride(endpoint())
                            .region(Region.of("auto"))
                            .credentialsProvider(credentials())
                            .serviceConfiguration(configuration())
                            .build();
        return presigner;
    }

    @PreDestroy
    public synchronized void close() {
        if (client != null) client.close();
        if (presigner != null) presigner.close();
    }
}
