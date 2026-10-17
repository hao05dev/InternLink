package com.internlink.core.shared.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

/**
 * Chế độ tính toán đối sánh mức độ phù hợp (AI Matching Mode):
 * - HYBRID: Kết hợp cả kỹ năng (55%) và vector ngữ nghĩa (35%).
 * - SKILL_ONLY: Chỉ tính trên tập kỹ năng đã xác nhận.
 * - SEMANTIC_ONLY: Chỉ tính trên độ tương đồng Cosine của vector nội dung.
 * - INSUFFICIENT_DATA: Không đủ dữ liệu hồ sơ hoặc JD để đối sánh.
 */
public enum AiMatchingMode {
    HYBRID("hybrid"),
    SKILL_ONLY("skill_only"),
    SEMANTIC_ONLY("semantic_only"),
    INSUFFICIENT_DATA("insufficient_data");

    private final String value;

    AiMatchingMode(String value) {
        this.value = value;
    }

    @JsonValue
    public String getValue() {
        return value;
    }

    @JsonCreator
    public static AiMatchingMode fromValue(String value) {
        if (value == null || value.isBlank()) {
            return INSUFFICIENT_DATA;
        }
        for (AiMatchingMode mode : values()) {
            if (mode.value.equalsIgnoreCase(value.trim()) || mode.name().equalsIgnoreCase(value.trim())) {
                return mode;
            }
        }
        return INSUFFICIENT_DATA;
    }
}
