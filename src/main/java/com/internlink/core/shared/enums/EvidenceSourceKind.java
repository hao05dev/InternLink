package com.internlink.core.shared.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

/**
 * Loại nguồn gốc của minh chứng kỹ năng:
 * - DOCUMENT: Trích xuất trực tiếp từ tệp tin CV (PDF, DOCX).
 * - SUBMITTED_TEXT: Trích xuất từ văn bản người dùng dán vào ô nhập liệu.
 * - MANUAL: Nhập và tự khai báo thủ công bởi sinh viên/doanh nghiệp.
 */
public enum EvidenceSourceKind {
    DOCUMENT("document"),
    SUBMITTED_TEXT("submitted_text"),
    MANUAL("manual");

    private final String value;

    EvidenceSourceKind(String value) {
        this.value = value;
    }

    @JsonValue
    public String getValue() {
        return value;
    }

    @JsonCreator
    public static EvidenceSourceKind fromValue(String value) {
        if (value == null || value.isBlank()) {
            return MANUAL;
        }
        for (EvidenceSourceKind kind : values()) {
            if (kind.value.equalsIgnoreCase(value.trim()) || kind.name().equalsIgnoreCase(value.trim())) {
                return kind;
            }
        }
        return MANUAL;
    }
}
