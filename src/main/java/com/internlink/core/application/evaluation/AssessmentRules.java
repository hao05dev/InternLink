package com.internlink.core.application.evaluation;

import com.internlink.core.shared.exception.BadRequestException;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;

/** Validates the approved syllabus snapshot and calculates its component rubrics. */
public final class AssessmentRules {
    private AssessmentRules() {}

    public static void validate(List<Map<String, Object>> components) {
        if (components == null || components.isEmpty()) throw new BadRequestException("Cần ít nhất một thành phần đánh giá");
        Set<String> codes = new HashSet<>();
        BigDecimal sum = BigDecimal.ZERO;
        for (Map<String, Object> component : components) {
            String code = requiredString(component, "code");
            requiredString(component, "name");
            if (!codes.add(code)) throw new BadRequestException("Mã thành phần đánh giá bị trùng: " + code);
            String role = requiredString(component, "assessorRole");
            if (!role.equals("COMPANY_MENTOR") && !role.equals("LECTURER"))
                throw new BadRequestException("Người chấm phải là COMPANY_MENTOR hoặc LECTURER");
            BigDecimal weight = number(component.get("weight"));
            if (weight.signum() <= 0 || weight.compareTo(BigDecimal.ONE) > 0)
                throw new BadRequestException("Trọng số thành phần phải lớn hơn 0 và không quá 1");
            sum = sum.add(weight);
            List<Map<String, Object>> criteria = criteria(component);
            if (!criteria.isEmpty()) {
                Set<String> criterionCodes = new HashSet<>();
                BigDecimal criterionTotal = BigDecimal.ZERO;
                for (Map<String, Object> criterion : criteria) {
                    String criterionCode = requiredString(criterion, "code");
                    requiredString(criterion, "name");
                    if (!criterionCodes.add(criterionCode))
                        throw new BadRequestException("Mã tiêu chí bị trùng: " + criterionCode);
                    BigDecimal criterionWeight = number(criterion.get("weight"));
                    if (criterionWeight.signum() <= 0) throw new BadRequestException("Trọng số tiêu chí phải lớn hơn 0");
                    criterionTotal = criterionTotal.add(criterionWeight);
                }
                if (criterionTotal.compareTo(BigDecimal.ONE) != 0)
                    throw new BadRequestException("Tổng trọng số tiêu chí của " + code + " phải bằng 1");
            }
        }
        if (sum.compareTo(BigDecimal.ONE) != 0)
            throw new BadRequestException("Tổng trọng số các thành phần đánh giá phải bằng 1");
    }

    public static Map<String, Object> component(List<Map<String, Object>> components, String code) {
        return components.stream().filter(c -> code.equals(c.get("code"))).findFirst()
            .orElseThrow(() -> new BadRequestException("Thành phần không thuộc đề cương: " + code));
    }

    public static BigDecimal componentScore(Map<String, Object> component, BigDecimal directScore,
                                            Map<String, BigDecimal> criterionScores) {
        List<Map<String, Object>> criteria = criteria(component);
        if (criteria.isEmpty()) return score10(directScore);
        if (criterionScores == null || criterionScores.size() != criteria.size())
            throw new BadRequestException("Cần chấm đủ các tiêu chí của thành phần");
        BigDecimal total = BigDecimal.ZERO;
        for (Map<String, Object> criterion : criteria) {
            String code = requiredString(criterion, "code");
            total = total.add(score10(criterionScores.get(code)).multiply(number(criterion.get("weight"))));
        }
        return total.setScale(1, RoundingMode.HALF_UP);
    }

    public static BigDecimal number(Object value) {
        try { return new BigDecimal(String.valueOf(value)); }
        catch (Exception ex) { throw new BadRequestException("Trọng số hoặc điểm không hợp lệ"); }
    }

    public static BigDecimal score10(BigDecimal score) {
        if (score == null || score.compareTo(BigDecimal.ZERO) < 0 || score.compareTo(BigDecimal.TEN) > 0)
            throw new BadRequestException("Điểm phải nằm trong khoảng 0 đến 10");
        if (score.stripTrailingZeros().scale() > 1)
            throw new BadRequestException("Điểm thành phần chỉ được có một chữ số thập phân");
        return score.setScale(1, RoundingMode.HALF_UP);
    }

    private static String requiredString(Map<String, Object> map, String key) {
        Object value = map.get(key);
        if (!(value instanceof String text) || text.isBlank())
            throw new BadRequestException("Thiếu trường " + key + " trong đề cương");
        return text.trim();
    }

    @SuppressWarnings("unchecked")
    private static List<Map<String, Object>> criteria(Map<String, Object> component) {
        Object value = component.get("criteria");
        if (value == null) return List.of();
        if (!(value instanceof List<?> list) || list.stream().anyMatch(item -> !(item instanceof Map)))
            throw new BadRequestException("Danh sách tiêu chí không hợp lệ");
        return (List<Map<String, Object>>) value;
    }
}
