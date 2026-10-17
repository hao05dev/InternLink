package com.internlink.core.shared.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

/**
 * Trạng thái ngữ cảnh của kỹ năng được AI trích xuất từ văn bản:
 * - MENTIONED: Kỹ năng được nhắc đến ở dạng khẳng định ("thành thạo Java").
 * - NEGATED: Kỹ năng bị phủ định ("chưa biết Docker", "chưa từng làm việc").
 * - LEARNING: Kỹ năng đang trong quá trình học hỏi ("đang học Kubernetes").
 */
public enum AssertionStatus {
    MENTIONED("mentioned"),
    NEGATED("negated"),
    LEARNING("learning");

    private final String value;

    AssertionStatus(String value) {
        this.value = value;
    }

    @JsonValue
    public String getValue() {
        return value;
    }

    @JsonCreator
    public static AssertionStatus fromValue(String value) {
        if (value == null || value.isBlank()) {
            return MENTIONED;
        }
        for (AssertionStatus status : values()) {
            if (status.value.equalsIgnoreCase(value.trim()) || status.name().equalsIgnoreCase(value.trim())) {
                return status;
            }
        }
        return MENTIONED;
    }
}
