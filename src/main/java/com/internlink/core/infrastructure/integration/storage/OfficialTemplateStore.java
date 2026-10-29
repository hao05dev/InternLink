package com.internlink.core.infrastructure.integration.storage;

import com.internlink.core.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Component;

import java.util.Optional;

/**
 * Đọc biểu mẫu chính thức (M-TT-01..05, Biểu mẫu 04) từ R2 theo khóa cố định
 * {@code <prefix>/templates/official/<fileName>}. Không đọc từ ổ đĩa cục bộ.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class OfficialTemplateStore {

    static final String FOLDER = "templates/official";

    private final R2StorageService r2;

    public Optional<Resource> find(String fileName) {
        if (fileName == null || fileName.isBlank() || fileName.contains("/") || fileName.contains("\\")) {
            return Optional.empty();
        }
        String key = key(fileName);
        try {
            return Optional.of(r2.loadAsResource(key));
        } catch (ResourceNotFoundException ex) {
            log.warn("Không tìm thấy biểu mẫu chính thức trên R2: {}", key);
            return Optional.empty();
        } catch (RuntimeException ex) {
            log.warn("Không tải được biểu mẫu chính thức từ R2 key={}: {}", key, ex.getMessage());
            return Optional.empty();
        }
    }

    public String key(String fileName) {
        String prefix = r2.prefix();
        return (prefix.isEmpty() ? "" : prefix + "/") + FOLDER + "/" + fileName;
    }
}
