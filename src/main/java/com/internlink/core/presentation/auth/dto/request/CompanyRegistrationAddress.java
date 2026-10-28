package com.internlink.core.presentation.auth.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.util.Map;

public record CompanyRegistrationAddress(
        @NotBlank @Size(max = 255) String street,
        @Size(max = 100) String ward,
        @NotBlank @Size(max = 100) String district,
        @NotBlank @Size(max = 100) String province) {
    public Map<String, Object> toMap() {
        return Map.of("street", street.trim(), "ward", ward == null ? "" : ward.trim(),
                "district", district.trim(), "province", province.trim());
    }
}
