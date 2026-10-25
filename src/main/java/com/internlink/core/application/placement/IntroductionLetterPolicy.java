package com.internlink.core.application.placement;

import com.internlink.core.domain.placement.IntroductionLetterRequest;
import com.internlink.core.shared.enums.IntroductionLetterStatus;
import com.internlink.core.shared.exception.BadRequestException;

final class IntroductionLetterPolicy {
    private IntroductionLetterPolicy() {}

    static void requireTransition(IntroductionLetterStatus from, IntroductionLetterStatus to) {
        boolean allowed = switch (from) {
            case PENDING -> to == IntroductionLetterStatus.APPROVED || to == IntroductionLetterStatus.REJECTED;
            case APPROVED -> to == IntroductionLetterStatus.ISSUED || to == IntroductionLetterStatus.REJECTED;
            case ISSUED, REJECTED, CANCELLED -> false;
        };
        if (!allowed) throw new BadRequestException("Không thể chuyển yêu cầu từ trạng thái " + from + " sang " + to);
    }

    static String issuedCode(IntroductionLetterRequest request, String requested) {
        if (requested != null && !requested.isBlank()) return requested.trim();
        if (request.getIssuedCode() != null) return request.getIssuedCode();
        return "GGT-" + request.getTerm().getCode() + "-"
                + request.getId().toString().substring(0, 8).toUpperCase();
    }
}
