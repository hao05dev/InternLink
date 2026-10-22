package com.internlink.core.application.ai_matching;

public record EligibilityResult(
    boolean isEligible,
    String reasonCode,
    String reasonMessage
) {
    public static EligibilityResult eligible() {
        return new EligibilityResult(true, "ELIGIBLE", "Đủ điều kiện tham gia ứng tuyển");
    }

    public static EligibilityResult ineligible(String code, String message) {
        return new EligibilityResult(false, code, message);
    }
}
