package com.internlink.core.infrastructure.integration.storage;

import lombok.Getter;
import lombok.Setter;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Getter
@Setter
@Component
@ConfigurationProperties("internlink.storage.r2")
public class R2StorageProperties {
    private String endpoint = "";
    private String bucket = "";
    private String accessKeyId = "";
    private String secretAccessKey = "";
    private String prefix = "internlink";
    private boolean directEnabled = false;
    private int presignedSeconds = 300;
    private int maxFileBytes = 20 * 1024 * 1024;
}
