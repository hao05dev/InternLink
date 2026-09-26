package com.internlink.core.presentation.system.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.core.io.Resource;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DocumentDownloadInfo {
    private Resource resource;
    private String originalName;
    private String mimeType;
    private Long sizeBytes;
    private String checksum;
}
