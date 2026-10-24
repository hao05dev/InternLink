package com.internlink.core.application.organization;

import org.springframework.core.io.Resource;

public record TemplateDownload(Resource resource, String fileName, String mimeType) {}
