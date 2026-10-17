package com.internlink.core.application.company.impl;

import com.internlink.core.domain.company.Company;
import com.internlink.core.presentation.company.dto.request.CompanyProfileRequest;
import com.internlink.core.shared.validation.MapUrlValidator;
import com.internlink.core.shared.exception.BadRequestException;
import org.jsoup.Jsoup;
import org.jsoup.safety.Safelist;
import org.springframework.stereotype.Component;

@Component
public class CompanyProfileMapper {
    public void apply(Company company, CompanyProfileRequest request) {
        String address = clean(request.getOfficeAddress());
        String embed = MapUrlValidator.embed(request.getMapEmbedUrl());
        String maps = MapUrlValidator.maps(request.getMapsUrl());
        if ((embed != null || maps != null) && address == null) {
            throw new BadRequestException("Nhập địa chỉ văn phòng trước khi thêm bản đồ.");
        }
        company.setDescription(request.getDescription() == null ? null : Jsoup.clean(
                request.getDescription(), Safelist.basic().addTags("h2", "h3")));
        company.setIndustry(clean(request.getIndustry()));
        company.setEmployeeRange(clean(request.getEmployeeRange()));
        company.setWebsite(MapUrlValidator.website(request.getWebsite()));
        company.setLogoUrl(clean(request.getLogoUrl()));
        company.setCoverImageUrl(clean(request.getCoverImageUrl()));
        company.setOfficeAddress(address);
        company.setMapEmbedUrl(embed);
        company.setMapsUrl(maps);
    }

    private String clean(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}
