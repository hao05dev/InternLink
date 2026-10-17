package com.internlink.core.application.system.upload;

import com.internlink.core.shared.enums.*;

import java.time.*;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

/** Object folders are server-generated; no email, student name or original filename in paths. */
public final class StorageFolders {
    private StorageFolders() {}

    private static String month() {
        return LocalDate.now(ZoneId.of("Asia/Ho_Chi_Minh"))
                .format(DateTimeFormatter.ofPattern("yyyy/MM"));
    }

    public static String document(ContextType context, UUID id, DocumentType type, UUID owner) {
        return "private/documents/"
                + context.name().toLowerCase()
                + "/"
                + id
                + "/"
                + type.name().toLowerCase()
                + "/owners/"
                + owner
                + "/"
                + month();
    }

    public static String signed(UUID placement, String kind) {
        return "private/placements/" + placement + "/signed/" + kind.toLowerCase() + "/" + month();
    }

    public static String media(MediaPurpose purpose, UUID context, UUID owner, String scope) {
        return switch (purpose) {
            case COMPANY_LOGO, COMPANY_COVER ->
                    "media/companies/" + context + "/" + purpose.folder() + "/" + month();
            case JOB_BANNER, JOB_IMAGE, JOB_ATTACHMENT ->
                    "media/recruitment/companies/"
                            + context
                            + "/"
                            + purpose.folder()
                            + "/"
                            + month();
            case POST_COVER, POST_IMAGE, POST_ATTACHMENT ->
                    "media/career-guide/authors/"
                            + context
                            + "/"
                            + purpose.folder()
                            + "/"
                            + month();
            case PORTFOLIO_IMAGE ->
                    "private/placements/"
                            + context
                            + "/"
                            + scope.toLowerCase()
                            + "/images/"
                            + month();
        };
    }
}
