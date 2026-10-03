package com.internlink.core.infrastructure.integration.storage;

import com.internlink.core.shared.enums.StorageProvider;
import com.internlink.core.shared.exception.BadRequestException;
import com.internlink.core.shared.exception.ResourceNotFoundException;
import jakarta.annotation.PreDestroy;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.auth.credentials.*;
import software.amazon.awssdk.core.checksums.RequestChecksumCalculation;
import software.amazon.awssdk.core.checksums.ResponseChecksumValidation;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.core.exception.SdkException;
import software.amazon.awssdk.http.urlconnection.UrlConnectionHttpClient;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.*;
import software.amazon.awssdk.services.s3.model.*;
import java.io.IOException;
import java.net.URI;
import java.security.MessageDigest;
import java.time.Duration;
import java.util.*;

@Service
public class R2StorageService implements StorageService {
    private final R2StorageProperties settings;
    private volatile S3Client client;

    @Autowired
    public R2StorageService(R2StorageProperties settings) { this.settings = settings; }

    // Package-local injection keeps tests entirely offline.
    R2StorageService(R2StorageProperties settings, S3Client client) { this.settings = settings; this.client = client; }

    private S3Client client() {
        if (client == null) synchronized (this) {
            if (client == null) {
                URI endpoint;
                try { endpoint = URI.create(settings.getEndpoint()); }
                catch (RuntimeException ex) { throw new IllegalStateException("R2_ENDPOINT không hợp lệ"); }
                if (!"https".equals(endpoint.getScheme()) || endpoint.getHost() == null
                    || !endpoint.getHost().endsWith(".r2.cloudflarestorage.com")
                    || endpoint.getUserInfo() != null || endpoint.getQuery() != null || endpoint.getFragment() != null
                    || !(endpoint.getPath().isEmpty() || "/".equals(endpoint.getPath()))
                    || settings.getBucket().isBlank() || settings.getAccessKeyId().isBlank() || settings.getSecretAccessKey().isBlank())
                    throw new IllegalStateException("Cần R2_ENDPOINT HTTPS, bucket và API key của Cloudflare");
                client = S3Client.builder().endpointOverride(endpoint).region(Region.of("auto"))
                    .credentialsProvider(StaticCredentialsProvider.create(AwsBasicCredentials.create(
                        settings.getAccessKeyId(), settings.getSecretAccessKey())))
                    .httpClientBuilder(UrlConnectionHttpClient.builder().connectionTimeout(Duration.ofSeconds(5))
                        .socketTimeout(Duration.ofSeconds(30)))
                    .overrideConfiguration(config -> config.apiCallTimeout(Duration.ofSeconds(45))
                        .apiCallAttemptTimeout(Duration.ofSeconds(35)))
                    .serviceConfiguration(S3Configuration.builder().pathStyleAccessEnabled(true)
                        .chunkedEncodingEnabled(false).build())
                    .requestChecksumCalculation(RequestChecksumCalculation.WHEN_REQUIRED)
                    .responseChecksumValidation(ResponseChecksumValidation.WHEN_REQUIRED).build();
            }
        }
        return client;
    }

    @Override public StoredFileInfo store(MultipartFile file, String subFolder) {
        if (file == null || file.isEmpty()) throw new BadRequestException("Tệp tải lên không được rỗng");
        if (file.getSize() > settings.getMaxFileBytes()) throw new BadRequestException("Tệp vượt giới hạn lưu trữ");
        String original = Objects.toString(file.getOriginalFilename(), "document").replace('\\', '/');
        original = original.substring(original.lastIndexOf('/') + 1).replaceAll("[\\r\\n\\p{Cntrl}]", "_");
        if (original.isBlank()) original = "document";
        if (original.length() > 180) original = original.substring(original.length() - 180);
        String extension = original.contains(".") ? original.substring(original.lastIndexOf('.')).toLowerCase(Locale.ROOT) : "";
        if (!extension.matches("\\.[a-z0-9]{1,10}")) extension = "";
        String folder = Objects.toString(subFolder, "general").replaceAll("[^a-zA-Z0-9_-]", "_");
        String prefix = settings.getPrefix().replaceAll("[^a-zA-Z0-9/_-]", "_").replaceAll("^/+|/+$", "");
        String key = (prefix.isEmpty() ? "" : prefix + "/") + folder + "/" + UUID.randomUUID() + extension;
        String mime = Objects.toString(file.getContentType(), "application/octet-stream");
        if (mime.isBlank()) mime = "application/octet-stream";
        try { org.springframework.http.MediaType.parseMediaType(mime); }
        catch (IllegalArgumentException ex) { throw new BadRequestException("Loại tệp không hợp lệ"); }
        if (mime.contains("\r") || mime.contains("\n")) throw new BadRequestException("Loại tệp không hợp lệ");
        try (var input = file.getInputStream()) {
            byte[] bytes = input.readNBytes(settings.getMaxFileBytes() + 1);
            if (bytes.length > settings.getMaxFileBytes()) throw new BadRequestException("Tệp vượt giới hạn lưu trữ");
            String checksum = HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(bytes));
            client().putObject(PutObjectRequest.builder().bucket(settings.getBucket()).key(key)
                .contentType(mime).metadata(Map.of("sha256", checksum)).build(), RequestBody.fromBytes(bytes));
            return StoredFileInfo.builder().provider(StorageProvider.R2).providerFileId(key)
                .providerFolderId(settings.getBucket()).storagePathOrUrl("r2://" + settings.getBucket() + "/" + key)
                .originalName(original).mimeType(mime).sizeBytes((long) bytes.length).checksum(checksum).build();
        } catch (IOException | java.security.NoSuchAlgorithmException ex) {
            throw new IllegalStateException("Không đọc được tệp để lưu vào R2");
        } catch (SdkException ex) { throw new IllegalStateException("Không lưu được tệp vào R2"); }
    }

    @Override public Resource loadAsResource(String key) {
        validateKey(key);
        try (var stream = client().getObject(GetObjectRequest.builder().bucket(settings.getBucket()).key(key).build())) {
            if (stream.response().contentLength() != null && stream.response().contentLength() > settings.getMaxFileBytes())
                throw new BadRequestException("Tệp vượt giới hạn tải xuống");
            byte[] bytes = stream.readNBytes(settings.getMaxFileBytes() + 1);
            if (bytes.length > settings.getMaxFileBytes()) throw new BadRequestException("Tệp vượt giới hạn tải xuống");
            return new ByteArrayResource(bytes);
        } catch (NoSuchKeyException ex) { throw new ResourceNotFoundException("Không tìm thấy tệp trên R2"); }
        catch (IOException | SdkException ex) { throw new IllegalStateException("Không tải được tệp từ R2"); }
    }

    @Override public void delete(String key) {
        validateKey(key);
        try { client().deleteObject(DeleteObjectRequest.builder().bucket(settings.getBucket()).key(key).build()); }
        catch (SdkException ex) { throw new IllegalStateException("Không xóa được tệp khỏi R2"); }
    }
    private void validateKey(String key) {
        if (key == null || key.isBlank() || key.startsWith("/") || key.contains("..") || key.contains("\\") || key.contains("://"))
            throw new BadRequestException("Mã tệp R2 không hợp lệ");
        String prefix = settings.getPrefix().replaceAll("[^a-zA-Z0-9/_-]", "_").replaceAll("^/+|/+$", "");
        if (!prefix.isEmpty() && !key.startsWith(prefix + "/")) throw new BadRequestException("Tệp nằm ngoài phạm vi lưu trữ");
    }
    @Override public StorageProvider getProviderType() { return StorageProvider.R2; }
    @PreDestroy public void close() { if (client != null) client.close(); }
}
