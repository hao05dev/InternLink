package com.internlink.core.application.system.upload;

public enum MediaPurpose {
    JOB_BANNER("banners"),
    JOB_IMAGE("inline"),
    JOB_ATTACHMENT("attachments"),
    POST_COVER("covers"),
    POST_IMAGE("inline"),
    POST_ATTACHMENT("attachments"),
    PORTFOLIO_IMAGE("images");
    private final String folder;

    MediaPurpose(String folder) {
        this.folder = folder;
    }

    public String folder() {
        return folder;
    }

    public boolean job() {
        return name().startsWith("JOB_");
    }

    public boolean post() {
        return name().startsWith("POST_");
    }

    public boolean attachment() {
        return name().endsWith("_ATTACHMENT");
    }

    public boolean privateImage() {
        return this == PORTFOLIO_IMAGE;
    }
}
